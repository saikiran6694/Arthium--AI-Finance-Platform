import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  bulkDeleteTransactionIdsSchema,
  bulkTransactionSchema,
  createTransactionSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator";
import {
  bulkDeleteTransactionService,
  bulkTransactionService,
  createTransactionService,
  deleteTransactionByIdService,
  duplicateTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  scanReceiptService,
  updateTransactionService,
} from "../services/transaction.service";
import { TransactionEnumType } from "../models/transaction.model";

export const createTransactionController = asyncHandler(async (req: Request, res: Response) => {
  const body = createTransactionSchema.parse(req.body);
  const userId = req.user?._id;

  const transaction = await createTransactionService(body, userId);

  return res.status(HTTPSTATUS.CREATED).json({ message: "Transaction Created Successfully", transaction });
});

export const getTransactionController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const filters = {
    keyword: req.query.keyword as string | undefined,
    type: req.query.type as keyof typeof TransactionEnumType | undefined,
    recurringStatus: req.query.recurringStatus as "RECURRING" | "NON_RECURRING" | undefined,
  };

  const pagination = {
    pageSize: parseInt(req.query.pageSize as string) || 20,
    pageNumber: parseInt(req.query.pageNumber as string) || 1,
  };

  const result = await getAllTransactionsService(userId, filters, pagination);

  return res.status(HTTPSTATUS.OK).json({ message: "Transactions fetched successfully", ...result });
});

export const getTransactionByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const transactionId = transactionIdSchema.parse(req.params.id);

  const transaction = await getTransactionByIdService(transactionId, userId);

  return res.status(HTTPSTATUS.OK).json({ message: "Transaction fetched successfully", transaction });
});

export const duplicateTransactionController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const transactionId = transactionIdSchema.parse(req.params.id);

  const transaction = await duplicateTransactionService(transactionId, userId);

  return res.status(HTTPSTATUS.OK).json({ message: "Transaction fetched successfully", transaction });
});

export const updateTransactionController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const transactionId = transactionIdSchema.parse(req.params.id);

  const body = updateTransactionSchema.parse(req.body);

  await updateTransactionService(transactionId, userId, body);

  return res.status(HTTPSTATUS.OK).json({ message: "Transaction updated successfully" });
});

export const deleteTransactionByIdController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const transactionId = transactionIdSchema.parse(req.params.id);

  await deleteTransactionByIdService(transactionId, userId);

  return res.status(HTTPSTATUS.OK).json({ message: "Transaction deleted successfully" });
});

export const bulkDeleteTransactionController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { transactionIds } = bulkDeleteTransactionIdsSchema.parse(req.body);

  const result = await bulkDeleteTransactionService(transactionIds, userId);

  return res.status(HTTPSTATUS.OK).json({ message: "Transactions deleted successfully", result });
});

export const bulkTransactionController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const { transactions } = bulkTransactionSchema.parse(req.body);

  const transactionList = await bulkTransactionService(transactions, userId);

  return res.status(HTTPSTATUS.CREATED).json({ message: "Transactions created successfully", ...transactionList });
});

export const scanReceiptController = asyncHandler(async (req: Request, res: Response) => {
  const file = req?.file;

  const result = await scanReceiptService(file);

  return res.status(HTTPSTATUS.OK).json({ message: "Receipt Scanned Successfully", data: result });
});
