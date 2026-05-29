import { Env } from "../../../config/app.config";
import resendClient from "./resendClient";

type EmailSendType = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender =
  Env.NODE_ENV === "development"
    ? `no-reply <onboarding@resend.dev>`
    : `no-reply <${Env.MAILER_SENDER}>`;

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  from = mailer_sender,
}: EmailSendType) => {

  const {data , error} =await resendClient.emails.send({
    from,
    to,
    text,
    subject,
    html,
  });

  return data
};


export default sendEmail