import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { conversationIdParamSchema, createDmSchema } from "../validators/chat.validator";
import { conversationService } from "../services/conversation.service";
import { getIO } from "../socket";

export const createConversation = asyncHandler(async (req :Request ,res : Response) => {

    const {otherUserId} = createDmSchema.parse(req.body)
    const userId = req.user!.id


    const conversation = await conversationService.createConversation(userId , otherUserId)



     return res.status(HTTPSTATUS.OK).json({ success: true, conversation });
})


export const getAllConversations = asyncHandler(async(req: Request , res :Response ) => {


    const conversations = await conversationService.listForUser(req.user!.id);

  

    


    return res.status(HTTPSTATUS.OK).json({
        message : "Conversations fetched successfully",
        conversations
    })
})


export const getConversationController = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = conversationIdParamSchema.parse(req.params);
  const conversation = await conversationService.getById(conversationId, req.user!.id);
  return res.status(HTTPSTATUS.OK).json({ success: true, conversation });
});


export const markReadController = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = conversationIdParamSchema.parse(req.params);
  const userId = req.user!.id;
  const result = await conversationService.markRead(conversationId, userId);
  const summary = await conversationService.getInboxSummary(conversationId, userId);
  if (summary) {
    getIO().to(`user:${userId}`).emit("inbox:update", summary);
  }
  return res.status(HTTPSTATUS.OK).json({ success: true, ...result });
});
