import { Types } from "mongoose";
import MessageModel, {
  MessageMedia,
  MessageType,
} from "../models/message.model";
import { getActiveParticipant } from "./membership.service";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { BadRequestError } from "../utils/appError";
import ParticipantModel from "../models/participant.model";
import ConversationModel from "../models/conversation.model";

export interface SanitizedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  media?: MessageMedia;
  replyToId?: string;
  clientId?: string;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

function sanitize(msg: {
  _id: Types.ObjectId;
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
}): SanitizedMessage {
  return {
    id: msg._id.toString(),
    conversationId: msg.conversationId.toString(),
    senderId: msg.senderId.toString(),
    content: msg.content,
    type: msg.type,
    media: msg.media,
    replyToId: msg.replyToId?.toString(),
    clientId: msg.clientId,
    editedAt: msg.editedAt,
    deletedAt: msg.deletedAt,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  };
}

export const messageService = {
   async list(
    conversationId: string,
    userId: string,
    options: { limit: number; before?: string },
  ) {
    await getActiveParticipant(conversationId, userId);

    const filter: Record<string, unknown> = {
      conversationId: new Types.ObjectId(conversationId),
      deletedAt: { $exists: false },
    };

    if (options.before) {
      const cursor = await MessageModel.findById(options.before);
      if (!cursor || cursor.conversationId.toString() !== conversationId) {
        throw new BadRequestError(
          "Invalid cursor",
          HTTPSTATUS.BAD_REQUEST,
          ErrorCodeEnum.CHAT_INVALID_CURSOR,
        );
      }
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursor._id } },
      ];
    }

    const messages = await MessageModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(options.limit + 1)
      .lean();

    const hasMore = messages.length > options.limit;
    const slice = hasMore ? messages.slice(0, options.limit) : messages;

    const chronological = slice.reverse().map((m) => sanitize(m));

    return {
      messages: chronological,
      hasMore,
      nextCursor: hasMore ? slice[slice.length - 1]._id.toString() : undefined,
    };
  },
  async send(
    conversationId: string,
    senderId: string,
    data: {
      content?: string;
      type?: MessageType;
      media?: MessageMedia;
      replyToId?: string;
      clientId?: string;
    },
  ): Promise<SanitizedMessage> {
    await getActiveParticipant(conversationId, senderId);

    const type = data.type ?? "text";
    const content = (data.content ?? "").trim();

    if (type === "text" && !content) {
      throw new BadRequestError(
        "Message cannot be empty",
        HTTPSTATUS.BAD_REQUEST,
        ErrorCodeEnum.VALIDATION_ERROR,
      );
    }

    if (type !== "text" && !data.media) {
      throw new BadRequestError(
        "Media is required for this message type",
        HTTPSTATUS.BAD_REQUEST,
        ErrorCodeEnum.VALIDATION_ERROR,
      );
    }

    if (data.clientId) {
      const dup = await MessageModel.findOne({
        conversationId: new Types.ObjectId(conversationId),
        clientId: data.clientId,
      });
      if (dup) return sanitize(dup);
    }

    const preview =
      type === "text"
        ? content.slice(0, 200)
        : type === "image"
          ? "📷 Photo"
          : type === "voice"
            ? "🎤 Voice message"
            : `📎 ${data.media?.filename ?? "File"}`;

    const message = await MessageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(senderId),
      content: content || preview,
      type,
      media: data.media,
      replyToId: data.replyToId
        ? new Types.ObjectId(data.replyToId)
        : undefined,
      clientId: data.clientId,
    });

    await ConversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: {
        messageId: message._id,
        senderId: message.senderId,
        content: preview,
        type: message.type,
        createdAt: message.createdAt,
      },
      updatedAt: new Date(),
    });

    await ParticipantModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        leftAt: { $exists: false },
      },
      { $set: { updatedAt: new Date() } },
    );

    return sanitize(message);
  },
};
