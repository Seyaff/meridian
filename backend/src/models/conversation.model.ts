import mongoose, { Schema, Types } from "mongoose";

export type ConversationType = "dm" | "group";

export interface LastMessagePreview {
  messageId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  type: ConversationType;
  slug?: string;
  name?: string;
  avatarUrl?: string;
  dmKey?: string;
  createdBy: Types.ObjectId;
  lastMessage?: LastMessagePreview;
  createdAt: Date;
  updatedAt: Date;
}

const lastMessageSchema = new Schema<LastMessagePreview>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Message",
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Message",
    },
    content: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const conversationSchema = new Schema<IConversation>(
  {
    type: { type: String, enum: ["dm", "group"], required: true },
    slug: { type: String, unique: true, sparse: true, trim: true, maxlength: 24 },
    name: { type: String, trim: true, maxlength: 100 },
    avatarUrl: String,
    dmKey: { type: String, unique: true, sparse: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: lastMessageSchema,
  },
  {
    timestamps: true,
  },
);

const ConversationModel = mongoose.model<IConversation>(
  "Coversation",
  conversationSchema,
);
export default ConversationModel;
