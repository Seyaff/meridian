import { Resend } from "resend";
import { Env } from "../../../config/app.config";

const resendClient = new Resend(Env.RESEND_API_KEY)

export default resendClient