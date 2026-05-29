import * as express from "express";
import { UserRole } from "../models/user.model"

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole };
    }
  }
}
