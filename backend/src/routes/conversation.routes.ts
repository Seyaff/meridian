import { Router } from "express";
import { createConversation, getAllConversations , getConversationController, markReadController } from "../controllers/conversation.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const conversationRoutes = Router()

conversationRoutes.use(authenticate)


conversationRoutes.post("/create" , createConversation)
conversationRoutes.get("/all", getAllConversations)
conversationRoutes.get("/conversations/:conversationId", getConversationController);
conversationRoutes.patch("/:conversationId/read", markReadController);



export default conversationRoutes