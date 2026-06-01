import { Request, Response } from "express";

import { HTTPSTATUS } from "../config/http.config";
import { messageService } from "../services/message.service";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { conversationIdParamSchema, conversationSlugSchema, listMessagesQuerySchema, sendMessageSchema } from "../validators/chat.validator";

// Mock socket emitters to make code compilation friendly
const getIO = () => ({ to: (room: string) => ({ emit: (ev: string, data: any) => {} }) });
const emitInboxUpdate = async (...args: any[]) => {};

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const body = sendMessageSchema.parse(req.body);

    const result = await messageService.send(
      conversationId,
      req.user!.id,
      body,
    );

    const io = getIO();
    io.to(`conversation:${conversationId}`).emit("message:new", { message: result });
    await emitInboxUpdate(io, conversationId, result);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Message sent successfully",
      result,
    });
  },
);

export const listMessageController = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // Correctly extract the slug key out of the validated object payload
    const some = req.params.slug
    
    const slug = conversationSlugSchema.parse(req.params.slug);
 
    const query = listMessagesQuerySchema.parse(req.query);

    const result = await messageService.list(slug, req.user!.id, {
      limit: query.limit,
      before: query.before,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Messages fetched successfully",
      result,
    });
  },
);