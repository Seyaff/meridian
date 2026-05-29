import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { messageService } from "../services/message.service";
import {
  conversationIdParamSchema,
  sendMessageSchema,
  listMessagesQuerySchema
} from "../validators/chat.validator";
import { getIO } from "../socket";

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const body = sendMessageSchema.parse(req.body);

    const result = await messageService.send(
      conversationId,
      req.user!.id,
      body,
    );

    getIO()
      .to(`conversation:${conversationId}`)
      .emit("message:new", { result });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Message sent successfully",
      result,
    });
  },
);

export const listMessageController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const query = listMessagesQuerySchema.parse(req.query);
    const result = await messageService.list(conversationId, req.user!.id, {
      limit: query.limit,
      before: query.before,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Yo man get the fucking messages",
      result
    });
  },
);
