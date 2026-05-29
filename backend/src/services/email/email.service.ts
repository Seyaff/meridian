import sendEmail from "./resend/sendEmail";
import { passwordResetTemplate, verificationTemplate } from "./templates/verification.template";

export const emailService = {
  async sendVerificationEmail(email: string, token: string) {
    const data = await sendEmail({
      to: "seyaffxh@gmail.com",
      text: `Please verify your email by clicking the following link `,
      ...verificationTemplate(token),
    });


    return data
  },


  async sendPasswordResetEmail (email : string, rawToken: string) {
    const data = await sendEmail({
      to: "seyaffxh@gmail.com",
      text: "Reset your password by clicking the following link",
      ...passwordResetTemplate(rawToken)
    })
  }
};
