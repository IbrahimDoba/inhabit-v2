import nodemailer from 'nodemailer';

import { env } from './env.js';

const transport = env.smtpUrl ? nodemailer.createTransport(env.smtpUrl) : null;

/** Emails a sign-in code. Without SMTP configured, the code is printed to the server log instead. */
export async function sendSignInCode(email: string, code: string) {
  if (!transport) {
    console.log(`[mail] No SMTP_URL set. Sign-in code for ${email}: ${code}`);
    return;
  }
  await transport.sendMail({
    from: env.mailFrom,
    to: email,
    subject: `${code} is your DragonDen Garden code`,
    text: `Your DragonDen Garden sign-in code is ${code}.\n\nIt works for 10 minutes. If you did not ask for it, you can ignore this email.`,
    html: `<div style="font-family:system-ui,sans-serif;color:#2A2140">
      <p>Your DragonDen Garden sign-in code is</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:8px 0">${code}</p>
      <p style="color:#6F678A">It works for 10 minutes. If you did not ask for it, you can ignore this email.</p>
    </div>`,
  });
}
