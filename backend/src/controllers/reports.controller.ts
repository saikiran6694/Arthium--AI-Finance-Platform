import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { generateReportService, getAllReportsService, updateReportSettingService } from "../services/reports.service";
import { updateReportSettingsSchema } from "../validators/report.validator";

export const getAllReportsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const pagination = {
    pageSize: parseInt(req.query.pageSize as string) || 20,
    pageNumber: parseInt(req.query.pageNumber as string) || 1,
  };

  const result = await getAllReportsService(userId, pagination);

  return res.status(HTTPSTATUS.OK).json({ message: "Reports fetched successfully", ...result });
});

export const updateReportSettingsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  const body = updateReportSettingsSchema.parse(req.body);

  await updateReportSettingService(userId, body);

  return res.status(HTTPSTATUS.OK).json({ message: "Report Settings update successfully" });
});

export const generateReportController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { from, to } = req.query;
  const fromDate = new Date(from as string);
  const toDate = new Date(to as string);

  const result = await generateReportService(userId, fromDate, toDate);

  return res.status(HTTPSTATUS.OK).json({
    message: "Report generated successfully",
    ...result,
  });
});
