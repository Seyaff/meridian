import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");
const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^[a-z0-9]+$/i, "Invalid conversation slug");

export const conversationRefSchema = z
  .string()
  .trim()
  .refine((v) => objectIdSchema.safeParse(v).success || slugSchema.safeParse(v).success, {
    message: "Invalid conversation reference",
  });

export const conversationRefParamSchema = z.object({
  ref: conversationRefSchema,
});

export const updateNicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});
