import { Types } from "mongoose";
import ConversationModel from "../models/conversation.model";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { NotFoundError } from "../utils/appError";
import { generateUniqueConversationSlug, isObjectId } from "../utils/slug.util";

export async function ensureConversationSlug(
  conversationId: Types.ObjectId,
): Promise<string> {
  const conv = await ConversationModel.findById(conversationId);
  if (!conv) {
    throw new NotFoundError(
      "Conversation not found",
      HTTPSTATUS.NOT_FOUND,
      ErrorCodeEnum.CHAT_CONVERSATION_NOT_FOUND,
    );
  }
  if (conv.slug) return conv.slug;
  const slug = await generateUniqueConversationSlug();
  conv.slug = slug;
  await conv.save();
  return slug;
}

export async function resolveConversationId(ref: string): Promise<string> {
  if (isObjectId(ref)) {
    const conv = await ConversationModel.findById(ref);
    if (!conv) {
      throw new NotFoundError(
        "Conversation not found",
        HTTPSTATUS.NOT_FOUND,
        ErrorCodeEnum.CHAT_CONVERSATION_NOT_FOUND,
      );
    }
    if (!conv.slug) {
      await ensureConversationSlug(conv._id);
    }
    return conv._id.toString();
  }

  const conv = await ConversationModel.findOne({ slug: ref });
  if (!conv) {
    throw new NotFoundError(
      "Conversation not found",
      HTTPSTATUS.NOT_FOUND,
      ErrorCodeEnum.CHAT_CONVERSATION_NOT_FOUND,
    );
  }
  return conv._id.toString();
}
