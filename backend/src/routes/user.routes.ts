import { Router } from "express";
import { getPresenceController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const userRoutes = Router()


userRoutes.use(authenticate);



userRoutes.get("/presence", getPresenceController);

export default userRoutes