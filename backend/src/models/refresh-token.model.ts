import mongoose, { Document, Schema, Types } from "mongoose";
import { hashToken } from "../utils/hash.util";

export interface RefreshTokenDocument extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  familyId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    familyId: { type: String, required: true, index: true },
    userAgent: String,
    ipAddress: String,
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    revokedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

refreshTokenSchema.pre("save", function () {
  if (this.isModified("tokenHash")) {
    if (this.tokenHash) {
      this.tokenHash = hashToken(this.tokenHash);
    }
  }
});

export const RefreshTokenModel = mongoose.model<RefreshTokenDocument>(
  "RefreshToken",
  refreshTokenSchema,
);
