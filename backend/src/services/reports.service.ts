import mongoose from "mongoose";
import ReportSettingModel from "../models/report-settings.model";
import ReportModel from "../models/report.model";
import TransactionModel, { TransactionEnumType } from "../models/transaction.model";
import { NotFoundException } from "../utils/app-error";
import { calulateNextReportDate } from "../utils/helper";
import { UpdateReportSettingType } from "../validators/report.validator";
import { convertToDollarUnit } from "../utils/format-currency";
import { format } from "date-fns";
import { reportInsightPrompt } from "../utils/prompts";
import { genAI, genAIModel } from "../config/google-ai.config";
import { createUserContent } from "@google/genai";

export const getAllReportsService = async (
  userId: string,
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = { userId };

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [reports, totalCount] = await Promise.all([
    ReportModel.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
    ReportModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reports,
    pagination: {
      totalPages,
      totalCount,
      pageNumber,
      pageSize,
      skip,
    },
  };
};

export const updateReportSettingService = async (userId: string, body: UpdateReportSettingType) => {
  const { isEnabled } = body;
  let nextReportDate: Date | null = null;

  const existingReportSettings = await ReportSettingModel.findOne({
    userId: userId,
  });

  if (!existingReportSettings) throw new NotFoundException("Report settings not found");

  if (isEnabled) {
    const currentNextReportDate = existingReportSettings.nextReportDate;
    const now = new Date();

    if (!currentNextReportDate || currentNextReportDate <= now) {
      nextReportDate = calulateNextReportDate(existingReportSettings.lastSentDate);
    } else {
      nextReportDate = currentNextReportDate;
    }
  }

  existingReportSettings.set({
    ...body,
    nextReportDate,
  });

  await existingReportSettings.save();
  return;
};

export const generateReportService = async (userId: string, fromDate: Date, toDate: Date) => {
  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: {
                  $cond: [{ $eq: ["$type", TransactionEnumType.INCOME] }, { $abs: "$amount" }, 0],
                },
              },

              totalExpenses: {
                $sum: {
                  $cond: [{ $eq: ["$type", TransactionEnumType.EXPENSE] }, { $abs: "$amount" }, 0],
                },
              },
            },
          },
        ],

        categories: [
          {
            $match: { type: TransactionEnumType.EXPENSE },
          },
          {
            $group: {
              _id: "$category",
              total: { $sum: { $abs: "$amount" } },
            },
          },
          {
            $sort: { total: -1 },
          },
          {
            $limit: 5,
          },
        ],
      },
    },
    {
      $project: {
        totalIncome: {
          $arrayElemAt: ["$summary.totalIncome", 0],
        },
        totalExpenses: {
          $arrayElemAt: ["$summary.totalExpenses", 0],
        },
        categories: 1,
      },
    },
  ]);

  if (!results?.length || (results[0]?.totalIncome === 0 && results[0]?.totalExpenses === 0)) return null;

  const { totalIncome = 0, totalExpenses = 0, categories = [] } = results[0] || {};

  const byCategory = categories.reduce(
    (acc: any, { _id, total }: any) => {
      acc[_id] = {
        amount: convertToDollarUnit(total),
        percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      };
      return acc;
    },
    {} as Record<string, { amount: number; percentage: number }>
  );

  const availableBalance = totalIncome - totalExpenses;
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;

  const insights = await generateAIInsights({
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    categories: byCategory,
    periodLabel: periodLabel,
  });

  return {
    period: periodLabel,
    summary: {
      income: convertToDollarUnit(totalIncome),
      expenses: convertToDollarUnit(totalExpenses),
      balance: convertToDollarUnit(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      topCategories: Object.entries(byCategory)?.map(([name, cat]: any) => ({
        name,
        amount: cat.amount,
        percent: cat.percentage,
      })),
    },
    insights,
  };
};

async function generateAIInsights({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
}) {
  try {
    const prompt = reportInsightPrompt({
      totalIncome,
      totalExpenses,
      availableBalance,
      savingsRate,
      categories,
      periodLabel,
    });

    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [createUserContent([prompt])],
      config: {
        responseMimeType: "application/json",
      },
    });

    const response = result.text;
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) return [];

    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

const calculateSavingsRate = (totalIncome: number, totalExpenses: number) => {
  if (totalIncome <= 0) return 0;
  const savingPercentage = ((totalIncome - totalExpenses) / totalIncome) * 100;
  return parseFloat(savingPercentage.toFixed(2));
};
