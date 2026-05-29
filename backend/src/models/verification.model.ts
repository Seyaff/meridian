import mongoose, { Document, Schema, Types } from "mongoose";

export type VerificationPurpose = "email_verify" | "password_reset"

export interface IVerification extends Document {
  userId: Types.ObjectId;
  purpose: VerificationPurpose;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
  updatedAt : Date
}


const verificationTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: {
      type: String,
      enum: ["email_verify", "password_reset"],
      required: true,
    },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    usedAt: Date,
  } , {
    timestamps: true
})

verificationTokenSchema.index({ userId: 1, purpose: 1 });


const VerificationModel = mongoose.model<IVerification>("verification" , verificationTokenSchema)
export default VerificationModel