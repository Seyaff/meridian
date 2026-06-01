import { Router } from "express";
import {
  forgotPasswordController,
  loginUserController,
  logoutAllController,
  refreshController,
  registerUserController,
  resendVerificationController,
  resetPasswordController,
  verifyEmailController,
  getMeController,
  changePasswordController,
  logoutController,
  getUserController,
  updateProfileController,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const authRoutes = Router();

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginUserController);
authRoutes.get("/verify-email", verifyEmailController);
authRoutes.post("/resend-verification", resendVerificationController);
authRoutes.post("/forgot-password", forgotPasswordController);
authRoutes.post("/reset-password", resetPasswordController);
authRoutes.post("/refresh", refreshController);
authRoutes.post("/logout-all", authenticate, logoutAllController);
authRoutes.patch("/change-password", authenticate, changePasswordController);
authRoutes.get("/me", authenticate, getMeController);
authRoutes.patch("/me", authenticate, updateProfileController);
authRoutes.post("/logout", logoutController);
authRoutes.get("/:username", authenticate, getUserController);

export default authRoutes;
