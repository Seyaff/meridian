import UserModel from "../models/user.model";
import { presenceStore } from "../utils/presence.store";

export const userService = {
     async getPresence(userIds: string[]) {
    const users = await UserModel.find({
      _id: { $in: userIds },
      status: "active",
    })
      .select("lastSeenAt")
      .lean();

    return users.map((u) => ({
      userId: u._id.toString(),
      isOnline: presenceStore.isOnline(u._id.toString()),
      lastSeenAt: u.lastSeenAt,
    }));
  },
}