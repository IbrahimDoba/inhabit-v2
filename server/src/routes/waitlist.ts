import { randomBytes } from 'node:crypto';

import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';

import { db } from '../db/index.js';
import { waitlist } from '../db/schema.js';
import { env } from '../env.js';
import { cleanEmail, csvCell, isYes, rateLimiter } from '../lib/waitlist.js';
import { sendWaitlistWelcome } from '../mailer.js';
import { simplePage } from './page.js';

/** The website's sign-up form, the unsubscribe link, and the owner's download of the list. */
export const waitlistRoutes = new Hono();

const allow = rateLimiter(5, 10 * 60 * 1000);

waitlistRoutes.post('/waitlist', async (c) => {
  const wantsJson = (c.req.header('content-type') ?? '').includes('application/json');
  const reply = (status: 200 | 400 | 429, message: string) =>
    wantsJson
      ? c.json(status === 200 ? { ok: true, message } : { error: message }, status)
      : c.html(simplePage('Waitlist', `<h1>${message}</h1><p><a href="/">Back to DragonDen Garden</a></p>`), status);

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!allow(ip)) return reply(429, 'Too many tries. Please wait a few minutes.');

  let body: Record<string, unknown>;
  try {
    body = wantsJson ? await c.req.json() : await c.req.parseBody();
  } catch {
    return reply(400, 'That did not come through. Please try again.');
  }
  const done = 'You are on the list. We will email you at launch.';
  // A hidden field people never see; anything in it means a bot filled the form.
  if (typeof body.website === 'string' && body.website) return reply(200, done);

  const email = cleanEmail(body.email);
  if (!email) return reply(400, 'That email address does not look right.');
  const newsletter = isYes(body.newsletter);

  const token = randomBytes(24).toString('base64url');
  const inserted = await db
    .insert(waitlist)
    .values({ email, newsletter, token })
    .onConflictDoNothing()
    .returning();

  if (inserted.length) {
    // The sign-up counts even if the confirmation cannot be sent.
    sendWaitlistWelcome(email, `${env.siteUrl}/unsubscribe?token=${token}`).catch((err) =>
      console.error('[mail] Waitlist confirmation failed', err),
    );
  } else if (newsletter) {
    // Already on the list: ticking the box later still counts.
    await db.update(waitlist).set({ newsletter: true }).where(eq(waitlist.email, email));
  }
  // Same answer either way, so the form cannot be used to check who has signed up.
  return reply(200, done);
});

// The link in emails opens a page with a button, so mail scanners that follow links do not unsubscribe people.
waitlistRoutes.get('/unsubscribe', (c) => {
  const token = c.req.query('token') ?? '';
  return c.html(
    simplePage(
      'Leave the list',
      `<h1>Leave the DragonDen Garden list?</h1>
<p>Your email address will be deleted from it.</p>
<form method="post" action="/unsubscribe">
  <input type="hidden" name="token" value="${token.replace(/[^\w-]/g, '')}">
  <button type="submit">Yes, remove me</button>
</form>`,
    ),
  );
});

waitlistRoutes.post('/unsubscribe', async (c) => {
  const body = await c.req.parseBody();
  const token = typeof body.token === 'string' ? body.token : '';
  if (token) await db.delete(waitlist).where(eq(waitlist.token, token));
  return c.html(
    simplePage('Removed', `<h1>You are off the list.</h1><p>Your email address has been deleted. <a href="/">Back to DragonDen Garden</a></p>`),
  );
});

// Owner only: the list as a spreadsheet. The browser asks for user "admin" and ADMIN_PASSWORD.
waitlistRoutes.get('/admin/waitlist.csv', async (c, next) => {
  if (!env.adminPassword) return c.notFound();
  return basicAuth({ username: 'admin', password: env.adminPassword })(c, next);
}, async (c) => {
  const rows = await db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
  const lines = ['email,newsletter,joined'];
  for (const r of rows) lines.push([csvCell(r.email), r.newsletter ? 'yes' : 'no', r.createdAt.toISOString()].join(','));
  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', 'attachment; filename="dragonden-waitlist.csv"');
  c.header('Cache-Control', 'no-store');
  return c.body(lines.join('\n') + '\n');
});
