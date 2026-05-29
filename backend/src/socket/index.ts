import * as cookie from "cookie";
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { Env } from "../config/app.config";
import { chatHandlers } from "./handlers/chat.handler";
import { HttpError } from "../utils/appError";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { verifyAccessToken } from "../utils/token.util";
import { socketAuthMiddleware } from "./middlewares/socket.middleware";

let io: Server | null = null;

export type AuthedSocket = Socket & {
  user: {
    id: string;
    role: string;
  };
};

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: Env.FRONTEND_ORIGIN,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });



  io.use(socketAuthMiddleware)
  chatHandlers(io);


  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}
