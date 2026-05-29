import crypot from "crypto";

import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { IUser } from "../models/user.model";
import { ForbiddenError } from "../utils/appError";
import { RequestMeta } from "../utils/request.util";
import { addDays } from "../utils/date.util";
import { signAccessToken, signRefreshToken } from "../utils/token.util";
import { RefreshTokenModel } from "../models/refresh-token.model";
import { sanitizeUser } from "../utils/user.util";

export const tokenService = {
  async createTokenPair(user: IUser, meta: RequestMeta, familyId?: string) {
    if (!user.isEmailVerified) {
      throw new ForbiddenError(
        "Please verify your email before logging in",
        HTTPSTATUS.OK,
        ErrorCodeEnum.ACCESS_FORBIDDEN,
      );
    }

    const fid = familyId ?? crypto.randomUUID();
    const refreshToken = signRefreshToken(user._id.toString(), fid);
    const accessToken = signAccessToken(user._id.toString(), user.role);

    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash: refreshToken,
      familyId: fid,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      expiresAt: addDays(new Date(), 7),
    });

    return { accessToken, refreshToken, user: sanitizeUser(user) };
  },

  async revokeTokenFamily(familyId: string) {
    await RefreshTokenModel.updateMany(
      { familyId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  },


  async revokeRefreshByHash(tokenHash: string): Promise<void> {
    await RefreshTokenModel.updateOne({ tokenHash }, { revokedAt: new Date() });
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  },
};
