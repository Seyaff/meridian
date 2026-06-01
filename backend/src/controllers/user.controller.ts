import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { userService } from "../services/user.service";

export const getPresenceController = asyncHandler(
  async (req: Request, res: Response) => {
    const ids = String(req.query.ids ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 50);

      console.log(ids)

    const presence = await userService.getPresence(ids);
    return res.status(HTTPSTATUS.OK).json({ success: true, presence });
  },
);
