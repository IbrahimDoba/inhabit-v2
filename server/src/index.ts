import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { fileURLToPath } from 'node:url';

import { auth } from './auth.js';
import { db, pool } from './db/index.js';
import { env } from './env.js';
import { legalRoutes } from './routes/legal.js';
import { saveRoutes } from './routes/save.js';
import { siteRoutes } from './routes/site.js';
import { waitlistRoutes } from './routes/waitlist.js';
import type { AppEnv } from './types.js';

const app = new Hono<AppEnv>();
app.use(logger());

/** For Dokploy's health check and a quick look in the browser. */
app.get('/health', async (c) => {
  await pool.query('select 1');
  return c.json({ ok: true });
});

// The website's pictures and fonts (server/public). They only change with a deploy.
const assets = serveStatic({
  root: './public',
  onFound: (_path, c) => c.header('Cache-Control', 'public, max-age=604800'),
});
app.use('/img/*', assets);
app.use('/fonts/*', assets);
app.use('/favicon.png', assets);
app.use('/apple-touch-icon.png', assets);

// Public pages: the home page, the waitlist, the privacy policy and support.
app.route('/', siteRoutes);
app.route('/', waitlistRoutes);
app.route('/', legalRoutes);

// Sign-in, sign-out, sessions and account deletion: all handled by Better Auth.
app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// Everything under /v1 needs a signed-in user.
app.use('/v1/*', async (c, next) => {
  const result = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!result) return c.json({ error: 'Sign in first.' }, 401);
  c.set('user', result.user);
  c.set('session', result.session);
  await next();
});
app.get('/v1/me', (c) => {
  const user = c.get('user');
  return c.json({ id: user.id, email: user.email, name: user.name });
});
app.route('/v1/save', saveRoutes);

app.onError((err, c) => {
  // Deliberate answers such as the password prompt for the waitlist download.
  if (err instanceof HTTPException) return err.getResponse();
  console.error(err);
  return c.json({ error: 'Something went wrong on our side.' }, 500);
});

// Bring the database up to date, then start listening.
const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));
await migrate(db, { migrationsFolder });
serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`DragonDen Garden API listening on :${info.port}`);
});
