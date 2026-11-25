/** The plain page used for the privacy policy, support and the small waitlist pages. */
export function simplePage(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${title} · DragonDen Garden</title>
<link rel="icon" href="/favicon.png">
<style>
  :root { --bg: #F7F5FB; --text: #2A2140; --muted: #6F678A; --accent: #6C4FE0; --on-accent: #FFFFFF; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #16121F; --text: #F3EFFA; --muted: #A99FC2; --accent: #B8A9E8; --on-accent: #2A2140; }
  }
  body { font: 17px/1.6 -apple-system, system-ui, sans-serif; max-width: 40rem; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; background: var(--bg); color: var(--text); }
  a { color: var(--accent); }
  .home { display: inline-block; margin-bottom: 1.5rem; font-weight: 600; text-decoration: none; }
  h1 { font-size: 1.8rem; line-height: 1.2; }
  h2 { font-size: 1.15rem; margin-top: 2rem; }
  small { color: var(--muted); }
  button { font: inherit; font-weight: 600; padding: 0.7rem 1.4rem; border: 0; border-radius: 999px; background: var(--accent); color: var(--on-accent); cursor: pointer; }
</style>
</head>
<body>
<a class="home" href="/">DragonDen Garden</a>
${body}
</body>
</html>`;
}
