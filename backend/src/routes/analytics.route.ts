import { Router } from "express";
import { chartAnalyticsController, expenseBreakdownAnalyticsController, summaryAnalyticsController } from "../controllers/analytics.controller";

const analyticsRoute = Router();

analyticsRoute.get("/summary", summaryAnalyticsController);
analyticsRoute.get("/chart", chartAnalyticsController);
analyticsRoute.get("/expense-breakdown", expenseBreakdownAnalyticsController);

export default analyticsRoute;
