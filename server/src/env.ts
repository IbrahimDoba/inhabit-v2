/** Settings, read once from the environment (Dokploy's Environment tab, or .env when developing). */

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See server/README.md.`);
  return value;
}

export const env = {
  /** Postgres connection string, e.g. postgres://user:pass@host:5432/inhabit */
  databaseUrl: required('DATABASE_URL'),
  /** Long random string that signs sessions. Generate with: openssl rand -base64 32 */
  authSecret: required('BETTER_AUTH_SECRET'),
  /** Where this server is reachable from the app, e.g. https://api.example.com */
  publicUrl: required('BETTER_AUTH_URL'),
  port: Number(process.env.PORT ?? 3000),
  /** smtp://user:pass@host:587 (or smtps://…:465). Without it, sign-in codes are only logged. */
  smtpUrl: process.env.SMTP_URL ?? '',
  mailFrom: process.env.MAIL_FROM ?? 'DragonDen Garden <no-reply@localhost>',
  /** The app's URL scheme (app.json "scheme"), trusted for sign-in. */
  appScheme: process.env.APP_SCHEME ?? 'inhabit',
  /** Shown on the privacy page as the contact address. Optional. */
  supportEmail: process.env.SUPPORT_EMAIL ?? '',
  isDev: process.env.NODE_ENV !== 'production',
};
