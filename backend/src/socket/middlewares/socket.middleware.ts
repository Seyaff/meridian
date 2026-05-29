import { Socket } from "socket.io";
import * as cookie from "cookie";
import { verifyAccessToken } from "../../utils/token.util";
import { HttpError } from "../../utils/appError";
import { HTTPSTATUS } from "../../config/http.config";
import { ErrorCodeEnum } from "../../enums/error-code.enum";

export type AuthedSocket = Socket & {
  userId: string;
  userRole: string;
};

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie ?? "");
  const accessToken = cookies.accessToken;

  if (!accessToken) {
    throw new HttpError(
      "No access token . Please login",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  try {
    const payload = verifyAccessToken(accessToken);
    (socket as AuthedSocket).userId = payload.sub;
    (socket as AuthedSocket).userRole = payload.role;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
};
