import { Server } from "socket.io";
import { Types } from "mongoose";
import ParticipantModel from "../models/participant.model";
import { conversationService } from "../services/conversation.service";
import type { SanitizedMessage } from "../services/message.service";

function userRoom(userId: string) {
  return `user:${userId}`;
}

export async function emitInboxUpdate(
  io: Server,
  conversationId: string,
  message: SanitizedMessage,
) {
  const participants = await ParticipantModel.find({
    conversationId: new Types.ObjectId(conversationId),
    leftAt: { $exists: false },
  }).lean();

  for (const p of participants) {
    const userId = p.userId.toString();
    const summary = await conversationService.getInboxSummary(
      conversationId,
      userId,
    );
    if (!summary) continue;
    io.to(userRoom(userId)).emit("inbox:update", summary);
  }
}
