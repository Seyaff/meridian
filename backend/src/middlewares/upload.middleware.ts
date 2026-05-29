import multer from "multer";
import { Env } from "../config/app.config";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: Env.MAX_UPLOAD_BYTES },
}).single("file");
