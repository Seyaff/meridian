import { IUser } from "../models/user.model";
import VerificationModel, {
  VerificationPurpose,
} from "../models/verification.model";
import { addHours } from "../utils/date.util";
import { generateSecureToken, hashToken } from "../utils/hash.util";

export const verificationService = {
  async createToken(
    user: IUser,
    purpose: VerificationPurpose,
    validUntil: number,
  ) {
    await VerificationModel.updateMany(
      { userId: user._id, purpose, usedAt: { $exists: false } },
      { usedAt: new Date() },
    );

    const rawToken = generateSecureToken();
    await VerificationModel.create({
      userId: user._id,
      purpose,
      tokenHash: hashToken(rawToken),
      expiresAt: addHours(new Date(), validUntil),
    });


    return rawToken;
  },

  async findValidToken(token: string, purpose: VerificationPurpose) {
    return await VerificationModel.findOne({
      tokenHash: hashToken(token),
      purpose,
      userAt: { $exists: false },
    });
  },

  async markUsed(recordId: string): Promise<void> {
    await VerificationModel.findByIdAndUpdate(recordId, {
      usedAt: new Date(),
    });
  },

  async invalidateUnusedForUser(userId: string, purpose: VerificationPurpose) : Promise<void> {
     await VerificationModel.updateMany(
      { userId, purpose, usedAt: { $exists: false } },
      { usedAt: new Date() },
    );
  },
};
