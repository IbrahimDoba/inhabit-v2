import { Hono } from 'hono';

import { env } from '../env.js';

/** The privacy policy the app and its store listing link to. Plain HTML, no account needed. */
export const legalRoutes = new Hono();

const UPDATED = '17 November 2026';

function page(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${title} · DragonDen Garden</title>
<style>
  body { font: 17px/1.6 -apple-system, system-ui, sans-serif; max-width: 40rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  h1 { font-size: 1.8rem; line-height: 1.2; }
  h2 { font-size: 1.15rem; margin-top: 2rem; }
  small { opacity: 0.7; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

legalRoutes.get('/privacy', (c) => {
  const contact = env.supportEmail
    ? `<p>Questions or requests: <a href="mailto:${env.supportEmail}">${env.supportEmail}</a>.</p>`
    : '<p>Questions or requests: use the support link on the DragonDen Garden page in the App Store.</p>';

  return c.html(
    page(
      'Privacy',
      `<h1>DragonDen Garden privacy policy</h1>
<small>Last updated ${UPDATED}</small>

<p>DragonDen Garden is a habit app with a dragon and a garden. It is built so that what you do in it stays with you.</p>

<h2>What stays on your phone</h2>
<p>Your habits, your history, your dragon, your garden, the names you type and the answers you give when you set the app up are saved on your phone. Unless you add an email address (below), we do not receive them and cannot see them, and deleting the app deletes them.</p>

<h2>If you choose to save your dragon</h2>
<p>You can add an email address to keep a copy of your garden and bring it to a new phone. This is optional. If you do, we store your email address and a copy of what the app has saved on your phone: your habits and their history, your dragon and garden, the names you typed and your set-up answers. It is kept on our server in Germany and used only to give your garden back to you. We send you one email per sign-in, with the code.</p>
<p>You can delete the account from inside the app (Settings, Save your dragon, Delete account). That removes your email address and the cloud copy straight away. The garden on your phone stays.</p>

<h2>Reminders</h2>
<p>Reminders are scheduled on your phone. Nothing is sent to us to deliver them.</p>

<h2>Purchases</h2>
<p>If you buy DragonDen Plus, the payment is handled by Apple. We never see your card or your Apple ID. To know whether a subscription is active we use RevenueCat, which receives an anonymous id made for the app on your phone, what was bought and when, and basic device details such as the country and the version of the app. It does not receive your name, your habits or anything you have written.</p>

<h2>What we do not do</h2>
<p>No advertising, no tracking across other apps or websites, no selling of data, and no analytics about how you use the app.</p>

<h2>Children</h2>
<p>DragonDen Garden does not knowingly collect personal information from anyone, including children.</p>

<h2>Changes</h2>
<p>If the app starts to do something this page does not describe, this page will be updated before that reaches you.</p>

<h2>Contact</h2>
${contact}`,
    ),
  );
});
