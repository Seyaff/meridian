import { Request, Response, NextFunction } from "express";
import { BadRequestError, HttpError } from "../utils/appError";
import { verifyAccessToken } from "../utils/token.util";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import UserModel from "../models/user.model";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new HttpError(
      "No access token . Please login",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  const decoded = verifyAccessToken(accessToken);

  const user = await UserModel.findById(decoded.sub);
  if (
    !user ||
    !user.isEmailVerified ||
    ["pending", "deleted", "suspended"].includes(user.status)
  ) {
    throw new BadRequestError(
      "Account is not allowed to access this resource",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS,
    );
  }

  req.user = { id: decoded.sub, role: decoded.role };

  next();
};
