import { Env } from "../config/env.config";
import { resend } from "../config/resend.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mail_sender = `Saikiran <${Env.RESEND_MAILER_SENDER}>`;

export const sendMail = async ({ to, from = mail_sender, subject, text, html }: Params) => {
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });
};
