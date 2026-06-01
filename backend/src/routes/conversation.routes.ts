import { Router } from "express";
import {
  createConversation,
  deleteConversationController,
  getAllConversations,
  getConversationController,
  markReadController,
  updateNicknameController,
} from "../controllers/conversation.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const conversationRoutes = Router();

conversationRoutes.use(authenticate);

conversationRoutes.post("/create", createConversation);
conversationRoutes.get("/all", getAllConversations);
conversationRoutes.get("/:ref", getConversationController);
conversationRoutes.patch("/:ref/read", markReadController);
conversationRoutes.patch("/:ref/nickname", updateNicknameController);
conversationRoutes.delete("/:ref", deleteConversationController);

export default conversationRoutes;
