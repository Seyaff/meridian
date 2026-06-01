import "dotenv/config";

import type {Request , Response} from "express"

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { Env } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import authRoutes from "./routes/auth.routes";
import { HTTPSTATUS } from "./config/http.config";
import chatRoutes from "./routes/chat.routes";
import conversationRoutes from "./routes/conversation.routes";
import searchRoutes from "./routes/search.routes";
import userRoutes from "./routes/user.routes";

const app = express();

const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
  }),
);

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.get(`${BASE_PATH}/health`, (req: Request, res: Response) => {
 
  res.status(HTTPSTATUS.OK).json({ status: "ok", uptime: process.uptime() });
});

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/chat`, chatRoutes);
app.use(`${BASE_PATH}/conversations`, conversationRoutes);
app.use(`${BASE_PATH}/search`, searchRoutes);
app.use(`${BASE_PATH}/users`, userRoutes);

app.use(errorHandler);

export default app;
