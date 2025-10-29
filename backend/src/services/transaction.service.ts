import axios from "axios";
import TransactionModel, { TransactionEnumType } from "../models/transaction.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { calculateNextOccurance } from "../utils/helper";
import { BulkTransactionType, CreateTransactionType, UpdateTransactionType } from "../validators/transaction.validator";
import { genAI, genAIModel } from "../config/google-ai.config";
import { createPartFromBase64, createUserContent } from "@google/genai";
import { receiptPrompt } from "../utils/prompts";

export const createTransactionService = async (body: CreateTransactionType, userId: string) => {
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();

  if (body.isRecurring && body.recurringInterval) {
    const calculateDate = calculateNextOccurance(body.date, body.recurringInterval);
    nextRecurringDate = calculateDate < currentDate ? calculateNextOccurance(currentDate, body.recurringInterval) : calculateDate;
  }

  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: body.category,
    amount: Number(body.amount),
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate: nextRecurringDate,
    lastProcessed: null,
  });

  return await transaction.save();
};

export const getAllTransactionsService = async (
  userId: string,
  filters: { keyword?: string; type?: keyof typeof TransactionEnumType; recurringStatus?: "RECURRING" | "NON_RECURRING" },
  pagination: { pageSize: number; pageNumber: number }
) => {
  const { keyword, type, recurringStatus } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [{ title: { $regex: keyword, $options: "i" } }, { category: { $regex: keyword, $options: "i" } }];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    if (recurringStatus === "RECURRING") {
      filterConditions.isRecurring = true;
    } else if (recurringStatus === "NON_RECURRING") {
      filterConditions.isRecurring = false;
    }
  }

  const { pageSize, pageNumber } = pagination;

  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTransactionByIdService = async (transactionId: string, userId: string) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) throw new NotFoundException("Transaction not found");

  return transaction;
};

export const duplicateTransactionService = async (transactionId: string, userId: string) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId: userId,
  });

  if (!transaction) throw new NotFoundException("Transaction not found");

  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id: undefined,
    title: `Duplicate - ${transaction.title}`,
    description: transaction.description ? `${transaction.description} - (Duplicated)` : "Duplicated Transaction",
    isRecurring: false,
    recurringInterval: undefined,
    nextRecurringDate: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  return duplicated;
};

export const updateTransactionService = async (transactionId: string, userId: string, body: UpdateTransactionType) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId: userId,
  });

  if (!transaction) throw new NotFoundException("Transaction not found");

  const now = new Date();
  const isRecurring = body.isRecurring ?? transaction.isRecurring;
  const date = body.date !== undefined ? new Date(body.date) : transaction.date;
  const recurringInterval = body.recurringInterval || transaction.recurringInterval;

  let nextRecurringDate: Date | undefined;

  if (isRecurring && recurringInterval) {
    const calculateDate = calculateNextOccurance(now, recurringInterval);
    nextRecurringDate = calculateDate < now ? calculateNextOccurance(now, recurringInterval) : calculateDate;
  }

  transaction.set({
    ...(body.title && { title: body.title }),
    ...(body.description && { description: body.description }),
    ...(body.type && { type: body.type }),
    ...(body.category && { category: body.category }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...(body.amount !== undefined && { amount: Number(body.amount) }),
    date,
    isRecurring,
    nextRecurringDate,
    recurringInterval,
  });

  await transaction.save();

  return;
};

export const deleteTransactionByIdService = async (transactionId: string, userId: string) => {
  const deleted = await TransactionModel.findOneAndDelete({
    _id: transactionId,
    userId: userId,
  });

  if (!deleted) throw new NotFoundException("Transaction not found");
  return;
};

export const bulkDeleteTransactionService = async (transactionIds: string[], userId: string) => {
  const result = await TransactionModel.deleteMany({
    _id: { $in: transactionIds },
    userId: userId,
  });

  if (result.deletedCount === 0) throw new NotFoundException("No transaction found");

  return {
    success: true,
    deletedCount: result.deletedCount,
  };
};

export const bulkTransactionService = async (transactions: CreateTransactionType[], userId: string) => {
  try {
    const bulkOps = transactions.map((tx) => ({
      insertOne: {
        document: {
          ...tx,
          userId: userId,
          isRecurring: false,
          nextRecurringDate: null,
          recurringInterval: null,
          lastProcesses: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }));

    const result = await TransactionModel.bulkWrite(bulkOps, {
      ordered: true,
    });

    return {
      insertedCount: result.insertedCount,
      success: true,
    };
  } catch (error) {
    throw error;
  }
};

export const scanReceiptService = async (file: Express.Multer.File | undefined) => {
  if (!file) throw new BadRequestException("No file uploaded");

  try {
    if (!file.path) throw new BadRequestException("failed to upload file");

    const response = await axios.get(file.path, {
      responseType: "arraybuffer",
    });

    const base64String = Buffer.from(response.data).toString("base64");

    if (!base64String) throw new BadRequestException("Could not process file");

    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [createUserContent([receiptPrompt, createPartFromBase64(base64String, file.mimetype)])],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    });

    const responseData = result.text;
    const cleanText = responseData?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanText) {
      return {
        error: "Could not read reciept  content",
      };
    }

    const data = JSON.parse(cleanText);

    if (!data.amount) {
      return { error: "Reciept missing required information" };
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      paymentMethod: data.paymentMethod,
      type: data.type,
      receiptUrl: file.path,
    };
  } catch (error) {
    return { error: "Reciept scanning  service unavailable" };
  }
};
