import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Env } from "../config/app.config";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, Env.BCRYPT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

