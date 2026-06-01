import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { createDmSchema } from "../validators/chat.validator";
import { conversationRefParamSchema, updateNicknameSchema } from "../validators/conversation.validator";
import { conversationService } from "../services/conversation.service";
import { getIO } from "../socket";
import { resolveConversationId } from "../services/conversationResolver.service";

export const createConversation = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { otherUserId } = createDmSchema.parse(req.body);
    const userId = req.user!.id;
    const conversation = await conversationService.createConversation(
      userId,
      otherUserId,
    );
    return res.status(HTTPSTATUS.OK).json({ success: true, conversation });
  },
);

export const getAllConversations = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const conversations = await conversationService.listForUser(req.user!.id);
    return res.status(HTTPSTATUS.OK).json({
      message: "Conversations fetched successfully",
      conversations,
    });
  },
);

export const getConversationController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { ref } = conversationRefParamSchema.parse(req.params);
    const conversation = await conversationService.getByRef(ref, req.user!.id);
    return res.status(HTTPSTATUS.OK).json({ success: true, conversation });
  },
);

export const markReadController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { ref } = conversationRefParamSchema.parse(req.params);
    const userId = req.user!.id;
    const result = await conversationService.markRead(ref, userId);
    const conversationId = await resolveConversationId(ref);
    const summary = await conversationService.getInboxSummary(
      conversationId,
      userId,
    );
    if (summary) {
      getIO().to(`user:${userId}`).emit("inbox:update", summary);
    }
    return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
  },
);

export const updateNicknameController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { ref } = conversationRefParamSchema.parse(req.params);
    const { nickname } = updateNicknameSchema.parse(req.body);
    const conversation = await conversationService.updateNickname(
      ref,
      req.user!.id,
      nickname,
    );
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Nickname updated",
      conversation,
    });
  },
);

export const deleteConversationController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { ref } = conversationRefParamSchema.parse(req.params);
    const result = await conversationService.deleteForUser(ref, req.user!.id);
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Conversation removed",
      ...result,
    });
  },
);
