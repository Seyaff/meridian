import { z } from "zod";
import { conversationRefSchema } from "./conversation.validator";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");

export const createDmSchema = z.object({
  otherUserId: objectIdSchema,
});
export const conversationIdParamSchema = z.object({
  conversationId: conversationRefSchema,
});

export const listMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  before: objectIdSchema.optional(),
});



  const mediaSchema = z.object({
  url: z.string().url(),
  mimeType: z.string().min(1),
  filename: z.string().min(1),
  size: z.number().positive(),
  duration: z.number().positive().optional(),
});

export const sendMessageSchema = z
  .object({
    content: z.string().trim().max(4000).optional(),
    type: z.enum(["text", "image", "file", "voice"]).optional(),
    media: mediaSchema.optional(),
    replyToId: objectIdSchema.optional(),
    clientId: z.string().trim().max(64).optional(),
  })
  .refine(
    (data) => {
      const type = data.type ?? "text";
      if (type === "text") return (data.content ?? "").trim().length > 0;
      return !!data.media;
    },
    { message: "Text messages need content; media messages need media" },
  );
