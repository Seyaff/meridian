import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { RefreshTokenModel } from "../models/refresh-token.model";
import UserModel from "../models/user.model";
import {
  BadRequestError,
  ForbiddenError,
  HttpError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/appError";
import { addMinutes } from "../utils/date.util";
import { hashToken } from "../utils/hash.util";
import { RequestMeta } from "../utils/request.util";
import { signAccessToken, verifyRefreshToken } from "../utils/token.util";
import { sanitizePublicUser, sanitizeUser } from "../utils/user.util";
import { presenceStore } from "../utils/presence.store";
import { emailService } from "./email/email.service";
import { tokenService } from "./token.service";
import { verificationService } from "./verification.service";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

async function incrementFailedLogin(userId: string, attempts: number) {
  const user = await UserModel.findOne({ _id: userId });
  if (!user) {
    throw new NotFoundError("user not found");
  }

  const nextAttempts = (attempts ?? user.failedLoginAttempts) + 1;
  if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
    await UserModel.findByIdAndUpdate(userId, {
      failedLoginAttempts: 0,
      lockUntil: addMinutes(new Date(), LOCK_MINUTES),
    });
  } else {
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { failedLoginAttempts: 1 },
    });
  }
}

export const registerUserService = async (body: {
  name: string;
  username: string;
  email: string;
  password: string;
}) => {
  const { name, username, email, password } = body;

  const existingUser = await UserModel.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new HttpError(
        "Email is already taken",
        HTTPSTATUS.CONFLICT,
        ErrorCodeEnum.AUTH_EMAIL_ALREADY_EXISTS,
      );
    }
    if (existingUser.username === username) {
      throw new HttpError(
        "Username is already taken",
        HTTPSTATUS.CONFLICT,
        ErrorCodeEnum.AUTH_USERNAME_ALREADY_EXISTS,
      );
    }
  }

  const user = new UserModel({
    name,
    username,
    email,
    password,
    status: "pending",
  });

  await user.save();

  const rawToken = await verificationService.createToken(
    user,
    "email_verify",
    24,
  );

  await emailService.sendVerificationEmail(user.email, rawToken);

  return { message: "Check your email to verify your account" };
};

export const loginUserService = async (
  body: {
    email: string;
    password: string;
  },
  meta: RequestMeta,
) => {
  const { email, password } = body;

  const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user || user.status === "deleted") {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status === "suspended") {
    throw new ForbiddenError(
      "Account suspended",
      HTTPSTATUS.FORBIDDEN,
      ErrorCodeEnum.AUTH_ACCOUNT_SUSPENDED,
    );
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new HttpError(
      "Too many attempts. Try again later.",
      HTTPSTATUS.TOO_MANY_REQUESTS,
      ErrorCodeEnum.AUTH_ACCOUNT_LOCKED,
    );
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    await incrementFailedLogin(user._id.toString(), user.failedLoginAttempts);
    throw new UnauthorizedError("Invalid email or password");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;

  if (!user.isEmailVerified) {
    await user.save();
    throw new ForbiddenError(
      "Please verify your email before logging in",
      HTTPSTATUS.FORBIDDEN,
      ErrorCodeEnum.ACCESS_FORBIDDEN,
    );
  }

  if (user.status !== "active") {
    user.status = "active";
  }

  user.lastLoginAt = new Date();
  await user.save();

  return tokenService.createTokenPair(user, meta);
};

export const verifyEmailService = async (token: string, meta: RequestMeta) => {
  const record = await verificationService.findValidToken(
    token,
    "email_verify",
  );

  if (!record) {
    throw new BadRequestError("Invalid or expired verification link");
  }

  if (record.expiresAt <= new Date()) {
    throw new BadRequestError("Verification link expired");
  }

  const user = await UserModel.findById(record.userId);
  if (!user || user.status === "deleted") {
    throw new BadRequestError("Invalid verification link");
  }

  if (user.isEmailVerified) {
    await verificationService.markUsed(record._id.toString());
    return {
      alreadyVerified: true,
      message: "Email already verifed . You can login ",
    };
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.status = "active";
  await user.save();

  await verificationService.markUsed(record._id.toString());
  await verificationService.invalidateUnusedForUser(
    user._id.toString(),
    "email_verify",
  );

  const tokens = await tokenService.createTokenPair(user, meta);
  return { alreadyVerified: false, ...tokens };
};

export const refreshTokenService = async (
  tokens: { accessToken: string; refreshToken: string },
  meta: RequestMeta,
) => {
  const { accessToken, refreshToken } = tokens;

  if (!refreshToken || accessToken) {
    throw new ForbiddenError(
      "No refresh token provided or access token already available",
      HTTPSTATUS.FORBIDDEN,
      ErrorCodeEnum.ACCESS_FORBIDDEN,
    );
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError(
      "Invalid refresh token",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_INVALID_TOKEN,
    );
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshTokenModel.findOne({ tokenHash });

  if (!stored || stored.revokedAt) {
    if (stored?.familyId) {
      await tokenService.revokeTokenFamily(stored.familyId);
    }
    throw new UnauthorizedError(
      "Invalid refresh token",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_INVALID_TOKEN,
    );
  }

  if (stored.expiresAt < new Date()) {
    stored.expiresAt = new Date();
    await stored.save();
    throw new UnauthorizedError(
      "Refresh token expired",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_INVALID_TOKEN,
    );
  }

  const user = await UserModel.findById(stored.userId);
  if (!user || user.status === "deleted" || user.status === "suspended") {
    await tokenService.revokeRefreshByHash(tokenHash);
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (!user.isEmailVerified || user.status !== "active") {
    await tokenService.revokeAllForUser(user._id.toString());
    throw new ForbiddenError(
      "Account not eligible for refresh",
      HTTPSTATUS.FORBIDDEN,
      ErrorCodeEnum.AUTH_EMAIL_NOT_VERIFIED,
    );
  }

  const newAccessToken = signAccessToken(user._id.toString(), user.role);

  return {
    newAccessToken,
    user: sanitizeUser(user),
  };
};

export const forgotPasswordService = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const rawToken = await verificationService.createToken(
    user,
    "password_reset",
    1,
  );

  const something = await emailService.sendPasswordResetEmail(email, rawToken);

  return;
};

export const resetPasswordService = async (
  rawToken: string,
  password: string,
) => {
  if (!rawToken?.trim()) {
    throw new BadRequestError("Token required");
  }

  const record = await verificationService.findValidToken(
    rawToken,
    "password_reset",
  );

  if (!record) {
    throw new BadRequestError("Invalid or expired reset link");
  }

  if (record.expiresAt < new Date()) {
    throw new BadRequestError("Reset link expired");
  }

  const user = await UserModel.findById(record.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.password = password;
  user.passwordChangedAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

 
  await verificationService.markUsed(record._id.toString());
  await verificationService.invalidateUnusedForUser(
    user._id.toString(),
    "password_reset",
  );
  await tokenService.revokeAllForUser(user._id.toString());

  return;
};

export const resendVerificationService = async (email: string) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (user?.isEmailVerified) {
    throw new BadRequestError("Email already verified");
  }


  if (
    user &&
    !user.isEmailVerified &&
    ["active", "pending"].includes(user.status)
  ) {
    const rawToken = await verificationService.createToken(
      user,
      "email_verify",
      24,
    );
   
    await emailService.sendVerificationEmail(user.email, rawToken);
  }
};

export const getMeService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || user.status === "deleted") {
    throw new UnauthorizedError(
      "User not found",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_USER_NOT_FOUND,
    );
  }
  return sanitizeUser(user);
};

export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await UserModel.findById(userId);

  if (
    !user ||
    !user.isEmailVerified ||
    ["pending", "deleted"].includes(user.status)
  ) {
    throw new BadRequestError("Some problem occured bro");
  }

  const passwordMatch = await user.comparePassword(currentPassword);
  if (!passwordMatch) {
    throw new BadRequestError("Your old password does not match");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();

  await tokenService.revokeAllForUser(user._id.toString());

  return;
};

export const logoutService = async (rawToken: string) => {
  await tokenService.revokeRefreshByHash(hashToken(rawToken));
  return
};

export const updateProfileService = async (
  userId: string,
  data: { name?: string; bio?: string; avatarUrl?: string },
) => {
  const user = await UserModel.findById(userId);
  if (!user || user.status === "deleted") {
    throw new UnauthorizedError(
      "User not found",
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.AUTH_USER_NOT_FOUND,
    );
  }

  if (data.name !== undefined) user.name = data.name;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.avatarUrl !== undefined) {
    user.avatarUrl = data.avatarUrl === "" ? undefined : data.avatarUrl;
  }

  await user.save();
  return sanitizeUser(user);
};

export const getUserByUserNameService = async (
  username: string,
  userId: string
) => {
  // only fetch needed fields
  const currentUser = await UserModel.findById(userId).select("username");

  if (!currentUser) {
    throw new NotFoundError("Current user not found");
  }

  // prevent searching yourself
  if (currentUser.username.toLowerCase() === username.toLowerCase()) {
    throw new BadRequestError(
      "You cannot search for yourself",
      HTTPSTATUS.FORBIDDEN,
      ErrorCodeEnum.ACCESS_FORBIDDEN
    );
  }

  // find another user
  const userByUsername = await UserModel.findOne({
    username,
    _id: { $ne: currentUser._id },
  });

  if (!userByUsername || ["deleted", "suspended"].includes(userByUsername.status)) {
    throw new NotFoundError("User not found");
  }

  const profile = sanitizePublicUser(userByUsername);
  return {
    ...profile,
    isOnline: presenceStore.isOnline(profile.id) || profile.isOnline,
  };
};