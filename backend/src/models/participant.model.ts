import mongoose, { Schema, Types } from "mongoose";

export type ParticipantRole = "owner" | "admin" | "member";

export interface IParticipant extends Document {
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: ParticipantRole;
  joinedAt: Date;
  leftAt?: Date;
  lastReadAt?: Date;
  nickname?: string;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date,
    lastReadAt: Date,
    nickname: { type: String, trim: true, maxlength: 80 },
  },
  { timestamps: true },
);

participantSchema.index({ userId: 1, leftAt: 1 });
participantSchema.index({ conversationId: 1, userId: 1 }, { unique: true });

const ParticipantModel = mongoose.model<IParticipant>(
  "Participant",
  participantSchema,
);
export default ParticipantModel;
