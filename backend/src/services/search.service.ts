import { Types } from "mongoose";
import UserModel from "../models/user.model";
import { presenceStore } from "../utils/presence.store";

const baseUserFilter = {
  status: { $nin: ["deleted", "pending", "suspended"] as const },
  isEmailVerified: true,
};

function mapSearchUser(
  u: {
    _id: Types.ObjectId;
    username: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
    isOnline?: boolean;
    lastSeenAt?: Date;
  },
) {
  const id = u._id.toString();
  return {
    id,
    username: u.username,
    name: u.name,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    isOnline: presenceStore.isOnline(id) || !!u.isOnline,
    lastSeenAt: u.lastSeenAt,
  };
}

export const searchService = {
  async listSuggestedUsers(userId: string) {
    const users = await UserModel.find({
      _id: { $ne: userId },
      ...baseUserFilter,
    })
      .select("username name avatarUrl bio isOnline lastSeenAt")
      .sort({ recommendationScore: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return users.map(mapSearchUser);
  },

  async searchUsers(userId: string, query: string, limit = 20) {
    const q = query.trim();
    if (!q) {
      return this.listSuggestedUsers(userId);
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const users = await UserModel.find({
      _id: { $ne: userId },
      ...baseUserFilter,
      $or: [{ username: regex }, { name: regex }],
    })
      .select("username name avatarUrl bio isOnline lastSeenAt")
      .limit(Math.min(limit, 50))
      .lean();

    return users.map(mapSearchUser);
  },
};
