import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { sendMessageController  ,listMessageController } from "../controllers/message.controller";

const chatRoutes = Router()


chatRoutes.use(authenticate)


chatRoutes.post("/:conversationId/send" , sendMessageController)
chatRoutes.get("/:slug/list" , listMessageController)

export default chatRoutes