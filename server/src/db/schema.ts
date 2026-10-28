import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from './auth-schema.js';

export * from './auth-schema.js';

/**
 * One cloud save per account: the whole app state as JSON (dragon, habits, log,
 * onboarding answers). `version` goes up by one on every write, so a phone that
 * saves on top of an older copy is told instead of overwriting newer progress.
 */
export const saves = pgTable('saves', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull(),
  version: integer('version').notNull().default(1),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
