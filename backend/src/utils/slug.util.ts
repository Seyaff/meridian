import crypto from "crypto";
import ConversationModel from "../models/conversation.model";

const SLUG_LENGTH = 10;
const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateConversationSlug(): string {
  const bytes = crypto.randomBytes(SLUG_LENGTH);
  let slug = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += SLUG_CHARS[bytes[i]! % SLUG_CHARS.length];
  }
  return slug;
}

export async function generateUniqueConversationSlug(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = generateConversationSlug();
    const exists = await ConversationModel.exists({ slug });
    if (!exists) return slug;
  }
  return `${generateConversationSlug()}${Date.now().toString(36).slice(-4)}`;
}

export function isObjectId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(value);
}
