import { Router } from "express";
import { createConversation, getAllConversations , getConversationController } from "../controllers/conversation.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const conversationRoutes = Router()

conversationRoutes.use(authenticate)


conversationRoutes.post("/create" , createConversation)
conversationRoutes.get("/all", getAllConversations)
conversationRoutes.get("/conversations/:conversationId", getConversationController);



export default conversationRoutes