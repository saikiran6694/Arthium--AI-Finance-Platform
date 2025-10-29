import { Router } from "express";
import { generateReportController, getAllReportsController, updateReportSettingsController } from "../controllers/reports.controller";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportSettingsController);

export default reportRoutes;
