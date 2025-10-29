import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import "./config/passport.config";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import connectDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";
import { corsConfig } from "./config/cors.config";
import passport from "passport";
import { passportAuthenicateJwt } from "./config/passport.config";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";
import { initialiseCron } from "./cron";
import reportRoutes from "./routes/report.route";
import analyticsRoute from "./routes/analytics.route";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(corsConfig());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Server running prefectly",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenicateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenicateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenicateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenicateJwt, analyticsRoute);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();

  if (Env.NODE_ENV === "development") {
    await initialiseCron();
  }

  console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} environment`);
});
