import { serve } from '@hono/node-server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { fileURLToPath } from 'node:url';

import { auth } from './auth.js';
import { db, pool } from './db/index.js';
import { env } from './env.js';
import { saveRoutes } from './routes/save.js';
import type { AppEnv } from './types.js';

const app = new Hono<AppEnv>();
app.use(logger());

/** For Dokploy's health check and a quick look in the browser. */
app.get('/health', async (c) => {
  await pool.query('select 1');
  return c.json({ ok: true });
});

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
  console.error(err);
  return c.json({ error: 'Something went wrong on our side.' }, 500);
});

// Bring the database up to date, then start listening.
const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));
await migrate(db, { migrationsFolder });
serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`Inhabit API listening on :${info.port}`);
});
