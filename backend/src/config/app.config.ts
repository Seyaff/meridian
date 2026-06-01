import "dotenv/config"
import { getEnv } from "../utils/getEnv";


const appConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),


  MONGO_URI: getEnv("MONGO_URI" , "mongodb+srv://seyaffxh:BKPMklTQpQMojY93@chat.ecmzbkj.mongodb.net/"),

  FRONTEND_ORIGIN : getEnv("FRONTEND_ORIGIN"),

  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),

  BCRYPT_ROUNDS: Number(getEnv("BCRYPT_ROUNDS", "12")),
  MAILER_SENDER: getEnv("MAILER_SENDER"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY", ""),

  UPLOAD_DIR: getEnv("UPLOAD_DIR", "uploads"),
  MAX_UPLOAD_BYTES: Number(getEnv("MAX_UPLOAD_BYTES", String(25 * 1024 * 1024))),
  API_PUBLIC_URL: getEnv("API_PUBLIC_URL", "http://localhost:8000"),

});

export const Env = appConfig();