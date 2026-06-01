import {Router} from "express"
import { authenticate } from "../middlewares/authenticate.middleware"
import {
  searchUsersController,
  suggestedUsersController,
} from "../controllers/search.controller";

const searchRoutes = Router()

searchRoutes.use(authenticate)

searchRoutes.get("/suggested-users", suggestedUsersController);
searchRoutes.get("/users", searchUsersController);

export default searchRoutes