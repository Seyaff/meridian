import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { searchService } from "../services/search.service";

const searchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const suggestedUsersController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = req.user!.id;
    const result = await searchService.listSuggestedUsers(userId);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Users fetched successfully",
      result,
    });
  },
);

export const searchUsersController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = req.user!.id;
    const { q, limit } = searchQuerySchema.parse(req.query);
    const result = q
      ? await searchService.searchUsers(userId, q, limit)
      : await searchService.listSuggestedUsers(userId);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Users fetched successfully",
      result,
    });
  },
);