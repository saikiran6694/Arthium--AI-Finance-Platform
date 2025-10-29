import { getEnv } from "../utils/get-env";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  MONGO_URI: getEnv("MONGO_URL"),

  JWT_SECRET: getEnv("JWT_SECRET", "secret_jwt_token_finance"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),

  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "secret_jwt_refresh"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),

  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),

  FRONTEND_ORIGIN: getEnv("ALLOWED_ORIGINS", "localhost"),

  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  RESEND_MAILER_SENDER: getEnv("RESEND_MAILER_SENDER", ""),

  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
});

export const Env = envConfig();
