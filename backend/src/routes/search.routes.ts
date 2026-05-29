import {Router} from "express"
import { authenticate } from "../middlewares/authenticate.middleware"
import { suggestedUsersController } from "../controllers/search.controller"

const searchRoutes = Router()

searchRoutes.use(authenticate)

searchRoutes.get("/suggested-users" , suggestedUsersController)

export default searchRoutes