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
import { generateUniqueConversationSlug } from "../utils/slug.util";
import {
  ensureConversationSlug,
  resolveConversationId,
} from "./conversationResolver.service";

export interface ConversationListItem {
  id: string;
  slug: string;
  type: "dm" | "group";
  name?: string;
  avatarUrl?: string;
  dmKey?: string;
  nickname?: string;
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
    nickname?: string;
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
      nickname: p.nickname,
    };
  });
}

async function countUnread(
  conversationId: Types.ObjectId,
  userId: string,
  lastReadAt?: Date,
): Promise<number> {
  const filter: Record<string, unknown> = {
    conversationId,
    deletedAt: { $exists: false },
    senderId: { $ne: new Types.ObjectId(userId) },
  };
  if (lastReadAt) filter.createdAt = { $gt: lastReadAt };
  return MessageModel.countDocuments(filter);
}

function mapConversation(
  conv: {
    _id: Types.ObjectId;
    slug?: string;
    type: "dm" | "group";
    name?: string;
    avatarUrl?: string;
    dmKey?: string;
    lastMessage?: ConversationListItem["lastMessage"];
    updatedAt: Date;
    createdAt?: Date;
  },
  participants: Awaited<ReturnType<typeof enrichParticipants>>,
  membership: { lastReadAt?: Date; nickname?: string } | null,
  unreadCount: number,
  userId: string,
) {
  const other =
    conv.type === "dm"
      ? participants.find((p) => p.userId !== userId)
      : undefined;

  const displayName =
    membership?.nickname?.trim() ||
    (conv.type === "group" ? conv.name : other?.name) ||
    other?.username ||
    "Conversation";

  return {
    id: conv._id.toString(),
    slug: conv.slug!,
    type: conv.type,
    name: displayName,
    avatarUrl:
      conv.type === "group" ? conv.avatarUrl : other?.avatarUrl,
    dmKey: conv.dmKey,
    nickname: membership?.nickname,
    lastMessage: conv.lastMessage
      ? {
          messageId: String(conv.lastMessage.messageId),
          senderId: String(conv.lastMessage.senderId),
          content: conv.lastMessage.content,
          type: conv.lastMessage.type,
          createdAt: conv.lastMessage.createdAt,
        }
      : undefined,
    unreadCount,
    participants,
    updatedAt: conv.updatedAt,
    createdAt: conv.createdAt,
  };
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
      const slug = conv.slug ?? (await ensureConversationSlug(conv._id));
      conv.slug = slug;

      const participants = await enrichParticipants(conv._id);
      const unreadCount = await countUnread(conv._id, userId, m.lastReadAt);

      items.push(
        mapConversation(
          conv as Parameters<typeof mapConversation>[0],
          participants,
          m,
          unreadCount,
          userId,
        ) as ConversationListItem,
      );
    }
    items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return items;
  },

  async getByRef(ref: string, userId: string) {
    const conversationId = await resolveConversationId(ref);
    return this.getById(conversationId, userId);
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

    const slug = conv.slug ?? (await ensureConversationSlug(conv._id));

    const membership = await ParticipantModel.findOne({
      conversationId: conv._id,
      userId: new Types.ObjectId(userId),
    }).lean();

    const participants = await enrichParticipants(conv._id);
    const unreadCount = await countUnread(conv._id, userId, membership?.lastReadAt);

    return mapConversation(
      { ...conv, slug } as Parameters<typeof mapConversation>[0],
      participants,
      membership,
      unreadCount,
      userId,
    );
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
      const slug = await generateUniqueConversationSlug();
      conv = await ConversationModel.create({
        type: "dm",
        dmKey,
        slug,
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
    } else if (!conv.slug) {
      conv.slug = await ensureConversationSlug(conv._id);
      await conv.save();
    }

    return this.getById(conv._id.toString(), userId);
  },

  async markRead(ref: string, userId: string) {
    const conversationId = await resolveConversationId(ref);
    const participant = await getActiveParticipant(conversationId, userId);
    participant.lastReadAt = new Date();
    await participant.save();
    return { conversationId, lastReadAt: participant.lastReadAt };
  },

  async updateNickname(ref: string, userId: string, nickname?: string) {
    const conversationId = await resolveConversationId(ref);
    const participant = await getActiveParticipant(conversationId, userId);
    participant.nickname = nickname;
    await participant.save();
    return this.getById(conversationId, userId);
  },

  async deleteForUser(ref: string, userId: string) {
    const conversationId = await resolveConversationId(ref);
    const participant = await getActiveParticipant(conversationId, userId);
    participant.leftAt = new Date();
    await participant.save();
    return { conversationId, leftAt: participant.leftAt };
  },

  async getInboxSummary(conversationId: string, userId: string) {
    try {
      const conv = await this.getById(conversationId, userId);
      return {
        conversationId: conv.id,
        slug: conv.slug,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
        updatedAt: conv.updatedAt,
      };
    } catch {
      return null;
    }
  },
};
