import mongoose, { Schema, Types } from "mongoose";

export type MessageType = "text" | "image" | "file" | "voice";

export interface MessageMedia {
  url: string;
  mimeType: string;
  filename: string;
  size: number;
  duration?: number;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: MessageType;
  media?: MessageMedia;
  replyToId?: Types.ObjectId;
  clientId?: string;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<MessageMedia>({
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  duration: Number,
});

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 4000, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "file", "voice"],
      default: "text",
    },
    media: mediaSchema,
    replyToId: { type: Schema.Types.ObjectId, ref: "Message" },
    clientId: { type: String, maxlength: 64 },
    editedAt: Date,
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ conversationId: 1, clientId: 1 }, { sparse: true });

const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
export default MessageModel;
