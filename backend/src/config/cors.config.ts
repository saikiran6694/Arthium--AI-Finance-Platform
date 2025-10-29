import cors from "cors";
import { Env } from "./env.config";

export const corsConfig = () => {
  return cors({
    origin: (origin, callback) => {
      const allowedOrigins = Env.FRONTEND_ORIGIN.split(",");
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`${origin} not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    // preflightContinue: false,
    // maxAge: 600,
  });
};
