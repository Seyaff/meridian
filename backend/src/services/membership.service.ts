import { HydratedDocument, Types } from "mongoose";
import ParticipantModel, { IParticipant } from "../models/participant.model";
import ConversationModel from "../models/conversation.model";
import { ForbiddenError, NotFoundError } from "../utils/appError";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { resolveConversationId } from "./conversationResolver.service";

/**
 * Checks membership using a raw conversationId
 */
export async function getActiveParticipant(
  conversationRef: string,
  userId: string,
): Promise<HydratedDocument<IParticipant>> {
  const conversationId = await resolveConversationId(conversationRef);
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

/**
 * Checks membership using a human-readable slug string
 */
export async function getActiveParticipantBySlug(
  conversationSlug: string,
  userId: string,
): Promise<HydratedDocument<IParticipant> & { conversationId: Types.ObjectId }> {
  // 1. Find conversation to extract internal MongoDB ID
  const conversation = await ConversationModel.findOne({ slug: conversationSlug });
  
  if (!conversation) {
    throw new NotFoundError(
      "Conversation not found",
      HTTPSTATUS.NOT_FOUND,
      ErrorCodeEnum.CHAT_CONVERSATION_NOT_FOUND,
    );
  }

  // 2. Look up the participant record using internal database IDs
  const participant = await ParticipantModel.findOne({
    conversationId: conversation._id,
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

  // 3. Return the participant record, appended with the conversationId
  return Object.assign(participant, { conversationId: conversation._id as Types.ObjectId });
}