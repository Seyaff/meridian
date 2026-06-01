import { HydratedDocument, Types } from "mongoose";
import ParticipantModel, { IParticipant } from "../models/participant.model";
import { ForbiddenError } from "../utils/appError";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";

export async function getActiveParticipant(
  conversationId: string,
  userId: string,

): Promise<HydratedDocument<IParticipant>> { 
  const participant = await ParticipantModel.findOne({
    conversationId: new Types.ObjectId(conversationId),
    userId: new Types.ObjectId(userId),
    leftAt: { $exists: false },
  });

  if (!participant) {
    throw new ForbiddenError(
      "You are not a member of this conversation",
      HTTPSTATUS.FORBIDDEN,
      ErrorCodeEnum.CHAT_NOT_A_MEMBER,
    );
  }

  return participant;
}