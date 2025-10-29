import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { DateRangePreset } from "../enums/date-range.enum";
import { chartAnalyticsService, expensePieChartBreakdownService, summaryAnalyticsService } from "../services/analytics.service";

export const summaryAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { preset, to, from } = req.query;

  const filters = {
    dateRangePreset: preset as DateRangePreset,
    customFrom: from ? new Date(from as string) : undefined,
    customTo: to ? new Date(to as string) : undefined,
  };

  const stats = await summaryAnalyticsService(userId, filters.dateRangePreset, filters.customFrom, filters.customTo);

  return res.status(HTTPSTATUS.OK).json({ message: "Summary fetched successfully", stats });
});

export const chartAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { preset, to, from } = req.query;

  const filters = {
    dateRangePreset: preset as DateRangePreset,
    customFrom: from ? new Date(from as string) : undefined,
    customTo: to ? new Date(to as string) : undefined,
  };

  const stats = await chartAnalyticsService(userId, filters.dateRangePreset, filters.customFrom, filters.customTo);

  return res.status(HTTPSTATUS.OK).json({ message: "Chart fetched successfully", stats });
});

export const expenseBreakdownAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { preset, to, from } = req.query;

  const filters = {
    dateRangePreset: preset as DateRangePreset,
    customFrom: from ? new Date(from as string) : undefined,
    customTo: to ? new Date(to as string) : undefined,
  };

  const stats = await expensePieChartBreakdownService(userId, filters.dateRangePreset, filters.customFrom, filters.customTo);

  return res.status(HTTPSTATUS.OK).json({ message: "Expense Breakdown fetched successfully", stats });
});
