import UserModel from "../models/user.model";

export const searchService = {
  async listSuggestedUsers(userId: string) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const users = await UserModel.find({
      _id: { $ne: userId },

      status: {
        $nin: ["deleted", "pending", "suspended"],
      },

      isEmailVerified: true,
    })
      .select("username name avatarUrl bio isOnline lastSeenAt")

      .limit(20)
      .lean();

    return users;
  },
};
