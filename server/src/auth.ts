import { expo } from '@better-auth/expo';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';

import { db } from './db/index.js';
import * as schema from './db/schema.js';
import { env } from './env.js';
import { sendSignInCode } from './mailer.js';

/**
 * Accounts: sign in with a 6-digit code sent by email. New emails get an account
 * on first sign-in. Sessions last 60 days and refresh themselves while the app is used.
 */
export const auth = betterAuth({
  baseURL: env.publicUrl,
  secret: env.authSecret,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  trustedOrigins: [`${env.appScheme}://`, ...(env.isDev ? ['exp://**', 'http://localhost:*'] : [])],
  session: {
    expiresIn: 60 * 60 * 24 * 60,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: { enabled: true, window: 60, max: 30 },
  // App stores require that people can delete their account from inside the app.
  user: { deleteUser: { enabled: true } },
  plugins: [
    expo(),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp }) {
        await sendSignInCode(email, otp);
      },
    }),
  ],
});
