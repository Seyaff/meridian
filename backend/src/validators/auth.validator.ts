import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .min(1)
  .max(255);

export const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and a number",
  );

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  );

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().trim().min(1),
  newPassword: passwordSchema,
});

export const verifyEmailQuerySchema = z.object({
  token: z.string().trim().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

