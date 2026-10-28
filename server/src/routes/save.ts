import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/index.js';
import { saves } from '../db/schema.js';
import type { AppEnv } from '../types.js';

/** Largest save accepted, in bytes of JSON. A year of daily use is far below this. */
export const MAX_SAVE_BYTES = 512 * 1024;

export const saveRoutes = new Hono<AppEnv>();

/** The account's cloud save, or `data: null` before the first one. */
saveRoutes.get('/', async (c) => {
  const user = c.get('user');
  const [row] = await db.select().from(saves).where(eq(saves.userId, user.id));
  if (!row) return c.json({ data: null, version: 0, updatedAt: null });
  return c.json({ data: row.data, version: row.version, updatedAt: row.updatedAt.toISOString() });
});

/**
 * Replaces the cloud save. `baseVersion` is the version the phone last saw; if the
 * cloud has moved on since (another phone saved), nothing is written and the newer
 * copy comes back with 409 so the app can decide.
 */
saveRoutes.put('/', async (c) => {
  const user = c.get('user');
  const raw = await c.req.text();
  if (raw.length > MAX_SAVE_BYTES) return c.json({ error: 'Save is too large.' }, 413);

  let body: { data?: unknown; baseVersion?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: 'Body must be JSON.' }, 400);
  }
  if (typeof body.data !== 'object' || body.data === null || Array.isArray(body.data)) {
    return c.json({ error: '`data` must be an object.' }, 400);
  }
  const baseVersion = typeof body.baseVersion === 'number' ? body.baseVersion : 0;
  const now = new Date();

  if (baseVersion === 0) {
    // First save for this account; if one already exists, report it instead of overwriting.
    const inserted = await db
      .insert(saves)
      .values({ userId: user.id, data: body.data, version: 1, updatedAt: now })
      .onConflictDoNothing()
      .returning();
    if (inserted.length) return c.json({ version: 1, updatedAt: now.toISOString() });
  } else {
    const updated = await db
      .update(saves)
      .set({ data: body.data, version: baseVersion + 1, updatedAt: now })
      .where(and(eq(saves.userId, user.id), eq(saves.version, baseVersion)))
      .returning();
    if (updated.length) return c.json({ version: baseVersion + 1, updatedAt: now.toISOString() });
  }

  const [current] = await db.select().from(saves).where(eq(saves.userId, user.id));
  return c.json(
    {
      error: 'The cloud save is newer than this phone’s copy.',
      data: current?.data ?? null,
      version: current?.version ?? 0,
      updatedAt: current?.updatedAt.toISOString() ?? null,
    },
    409,
  );
});
