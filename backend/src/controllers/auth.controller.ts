import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  usernameSchema,
  verifyEmailQuerySchema,
} from "../validators/auth.validator";
import {
  forgotPasswordService,
  getMeService,
  loginUserService,
  refreshTokenService,
  registerUserService,
  resendVerificationService,
  resetPasswordService,
  verifyEmailService,
  changePasswordService,
  logoutService,
  getUserByUserNameService,
} from "../services/auth.service";
import { getRequestMeta } from "../utils/request.util";
import {
  cleareCookiePair,
  clearRefreshCookie,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAccessCookie,
  setRefreshCookie,
} from "../utils/cookie.util";
import { sanitizeUser } from "../utils/user.util";
import { BadRequestError } from "../utils/appError";
import { ErrorCodeEnum } from "../enums/error-code.enum";

export const registerUserController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const body = registerSchema.parse({ ...req.body });

    const result = await registerUserService(body);

    return res.status(HTTPSTATUS.OK).json({
      ...result,
    });
  },
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const body = loginSchema.parse(req.body);

    const result = await loginUserService(body, getRequestMeta(req));

    setAccessCookie(res, result.accessToken);
    setRefreshCookie(res, result.refreshToken);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "User logged in successfully",
      user: result.user,
    });
  },
);

export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { token } = verifyEmailQuerySchema.parse(req.query);

    const result = await verifyEmailService(token, getRequestMeta(req));

    if (
      "refreshToken" in result &&
      result.refreshToken &&
      "accessToken" in result &&
      result.accessToken
    ) {
      setAccessCookie(res, result.accessToken);
      setRefreshCookie(res, result.refreshToken);
    }

    if (result.alreadyVerified) {
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        messaeg: result.message,
        alreadyVerified: true,
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Email verified successfully",
    });
  },
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const tokens = {
      accessToken: getAccessTokenFromCookies(req),
      refreshToken: getRefreshTokenFromCookies(req),
    };

    const result = await refreshTokenService(tokens, getRequestMeta(req));

    if (!result.newAccessToken) {
      clearRefreshCookie(res);
    }

    setAccessCookie(res, result.newAccessToken);

    return res.status(HTTPSTATUS.OK).json({
      message: "Token refrsed successfully",
    });
  },
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email } = forgotPasswordSchema.parse(req.body);

    await forgotPasswordService(email);

    return res.status(HTTPSTATUS.OK).json({
      message: "We have sent you an email to reset your password",
    });
  },
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { token, password } = resetPasswordSchema.parse(req.body);

    await resetPasswordService(token, password);

    clearRefreshCookie(res);

    return res.status(HTTPSTATUS.OK).json({
      message: "Password reset successfully",
    });
  },
);

export const resendVerificationController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email } = resendVerificationSchema.parse(req.body);

    await resendVerificationService(email);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "A verification email has been sent",
    });
  },
);

export const logoutAllController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Being bulit",
    });
  },
);

export const getMeController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getMeService(req.user!.id);
    return res
      .status(HTTPSTATUS.OK)
      .json({ success: true, message: "User fetched successfully ", user });
  },
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = req.user!.id;

    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body,
    );

    await changePasswordService(userId, currentPassword, newPassword);

    cleareCookiePair(res);

    return res.status(HTTPSTATUS.OK).json({
      message: "Password change successfully",
    });
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const rawToken = getRefreshTokenFromCookies(req);
    await logoutService(rawToken);

    cleareCookiePair(res);

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged out successfully",
    });
  },
);


export const getUserController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {

    const username = usernameSchema.parse(req.params.username);

    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw new BadRequestError(
        "Unauthorized",
        HTTPSTATUS.UNAUTHORIZED,
        ErrorCodeEnum.ACCESS_UNAUTHORIZED
      );
    }

    const user = await getUserByUserNameService(
      username,
      currentUserId
    );

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  }
);