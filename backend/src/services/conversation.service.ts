import { Types } from "mongoose";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import ConversationModel from "../models/conversation.model";
import UserModel from "../models/user.model";
import { BadRequestError, NotFoundError } from "../utils/appError";
import { buildDmKey } from "../utils/dmKey.util";
import ParticipantModel, { ParticipantRole } from "../models/participant.model";
import MessageModel from "../models/message.model";
import { getActiveParticipant } from "./membership.service";

export interface ConversationListItem {
  id: string;
  type: "dm" | "group";
  name?: string;
  avatarUrl?: string;
  dmKey?: string;
  lastMessage?: {
    messageId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: Date;
  };
  unreadCount: number;
  participants: Array<{
    userId: string;
    role: ParticipantRole;
    name: string;
    username: string;
    avatarUrl?: string;
    lastReadAt?: Date;
  }>;
  updatedAt: Date;
}

async function enrichParticipants(conversationId: Types.ObjectId) {
  const participants = await ParticipantModel.find({
    conversationId,
    leftAt: { $exists: false },
  }).lean();

  const userIds = participants.map((p) => p.userId);
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select("name username avatarUrl")
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return participants.map((p) => {
    const u = userMap.get(p.userId.toString());
    return {
      userId: p.userId.toString(),
      role: p.role,
      name: u?.name ?? "Unknown",
      username: u?.username ?? "unknown",
      avatarUrl: u?.avatarUrl,
      lastReadAt: p.lastReadAt,
    };
  });
}

async function countUnread(
  conversationId: Types.ObjectId,
  lastReadAt?: Date,
): Promise<number> {
  const filter: Record<string, unknown> = {
    conversationId,
    deletedAt: { $exists: false },
  };
  if (lastReadAt) filter.createdAt = { $gt: lastReadAt };
  return MessageModel.countDocuments(filter);
}

export const conversationService = {
  async listForUser(userId: string) {
    const memberships = await ParticipantModel.find({
      userId: new Types.ObjectId(userId),
      leftAt: { $exists: false },
    })
      .sort({ updatedAt: -1 })
      .lean();

    const items: ConversationListItem[] = [];

    for (const m of memberships) {
      const conv = await ConversationModel.findById(m.conversationId);
      if (!conv) continue;
      const participants = await enrichParticipants(conv._id);
      const unreadCount = await countUnread(conv._id, m.lastReadAt);

      items.push({
        id: conv._id.toString(),
        type: conv.type,
        name: conv.name,
        avatarUrl: conv.avatarUrl,
        dmKey: conv.dmKey,
        lastMessage: conv.lastMessage
          ? {
              messageId: conv.lastMessage.messageId.toString(),
              senderId: conv.lastMessage.senderId.toString(),
              content: conv.lastMessage.content,
              type: conv.lastMessage.type,
              createdAt: conv.lastMessage.createdAt,
            }
          : undefined,
        unreadCount,
        participants,
        updatedAt: conv.updatedAt,
      });
    }
    items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return items;
  },

  async getById(conversationId: string, userId: string) {
    await getActiveParticipant(conversationId, userId);
    const conv = await ConversationModel.findById(conversationId).lean();
    if (!conv) {
      throw new NotFoundError(
        "Conversation not found",
        HTTPSTATUS.NOT_FOUND,
        ErrorCodeEnum.CHAT_CONVERSATION_NOT_FOUND,
      );
    }

    const membership = await ParticipantModel.findOne({
      conversationId: conv._id,
      userId: new Types.ObjectId(userId),
    }).lean();

    const participants = await enrichParticipants(conv._id);
    const unreadCount = await countUnread(conv._id, membership?.lastReadAt);

    return {
      id: conv._id.toString(),
      type: conv.type,
      name: conv.name,
      avatarUrl: conv.avatarUrl,
      dmKey: conv.dmKey,
      lastMessage: conv.lastMessage,
      unreadCount,
      participants,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  },

  async createConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestError(
        "Cannot create a DM with yourself",
        HTTPSTATUS.BAD_REQUEST,
        ErrorCodeEnum.CHAT_DM_SELF,
      );
    }

    const other = await UserModel.findById(otherUserId);
    if (!other || other.status === "deleted") {
      throw new NotFoundError(
        "User not found",
        HTTPSTATUS.NOT_FOUND,
        ErrorCodeEnum.AUTH_USER_NOT_FOUND,
      );
    }

    const dmKey = buildDmKey(userId, otherUserId);
    let conv = await ConversationModel.findOne({ dmKey });

    if (!conv) {
      conv = await ConversationModel.create({
        type: "dm",
        dmKey,
        createdBy: new Types.ObjectId(userId),
      });

      await ParticipantModel.insertMany([
        {
          conversationId: conv._id,
          userId: new Types.ObjectId(userId),
          role: "member",
        },
        {
          conversationId: conv._id,
          userId: new Types.ObjectId(otherUserId),
          role: "member",
        },
      ]);
    }

    return this.getById(conv._id.toString(), userId);
  },


  
};
