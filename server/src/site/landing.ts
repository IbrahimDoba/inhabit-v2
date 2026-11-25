/**
 * The public home page: what the app is, and the waitlist form.
 * One self-contained HTML string, so it needs no build step and no database to render.
 * Colours and fonts match the app (src/constants/theme.ts): lavender, mint, gold and plum,
 * Fredoka for headings and Nunito for text.
 */

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: 'What is DragonDen Garden?',
    a: 'DragonDen Garden is a habit tracker for iPhone. Keeping your daily habits raises a dragon from an egg, grows a garden and furnishes a den.',
  },
  {
    q: 'When does it launch?',
    a: 'It is in testing on iPhone now. Join the waitlist and we will email you when it reaches the App Store.',
  },
  {
    q: 'Is it free?',
    a: 'The app is free to use. DragonDen Plus is an optional subscription that brings home more diamonds and unlocks the Plus collection.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Your habits and your dragon are saved on your phone. Adding an email address is optional and only keeps a backup for a new phone.',
  },
  {
    q: 'What do you do with my email address?',
    a: 'We email you once at launch. You only get other news if you tick the box. Every email has a link that deletes your address from the list.',
  },
];

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function landingPage(siteUrl: string): string {
  const title = 'DragonDen Garden: a habit tracker that raises a dragon';
  const description =
    'DragonDen Garden is a habit tracker for iPhone. Keep small daily habits and a dragon hatches, grows up, and fills a garden and a den with you.';

  const structured = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: 'DragonDen Garden',
      alternateName: 'DragonDen Garden: Habit Pet',
      operatingSystem: 'iOS',
      applicationCategory: 'LifestyleApplication',
      description,
      url: siteUrl,
      image: `${siteUrl}/img/share.jpg`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: QUESTIONS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ]).replace(/</g, '\\u003c');

  const faq = QUESTIONS.map(
    ({ q, a }) => `<details>
          <summary>${escapeHtml(q)}</summary>
          <p>${escapeHtml(a)}</p>
        </details>`,
  ).join('\n        ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${siteUrl}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${siteUrl}/">
<meta property="og:image" content="${siteUrl}/img/share.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/fredoka-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/img/garden.webp" as="image">
<script type="application/ld+json">${structured}</script>
<style>
@font-face { font-family: Fredoka; font-weight: 600; font-display: swap; src: url(/fonts/fredoka-600.woff2) format("woff2"); }
@font-face { font-family: Nunito; font-weight: 400; font-display: swap; src: url(/fonts/nunito-400.woff2) format("woff2"); }
@font-face { font-family: Nunito; font-weight: 700; font-display: swap; src: url(/fonts/nunito-700.woff2) format("woff2"); }

:root {
  --bg: #F7F5FB; --surface: #FFFFFF; --muted-surface: #EEEAF6; --border: #E3DEEF;
  --text: #2A2140; --text-2: #5B5373;
  --accent: #6C4FE0; --accent-press: #5A3FCB; --on-accent: #FFFFFF; --accent-soft: #E4DDFA;
  --mint: #D9F3E3; --gold: #FBEBC2; --danger: #B03024;
  --shadow: 0 18px 40px rgba(59, 42, 74, 0.12);
  --r-card: 28px; --r-field: 16px;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16121F; --surface: #201A2C; --muted-surface: #2A2338; --border: #3A3150;
    --text: #F3EFFA; --text-2: #B9B0CF;
    --accent: #B8A9E8; --accent-press: #CABEF0; --on-accent: #2A2140; --accent-soft: #34285A;
    --mint: #1F3A2E; --gold: #40351A; --danger: #FF9A90;
    --shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  }
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 88px; -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--text); font: 400 18px/1.6 Nunito, system-ui, sans-serif; }
img { display: block; max-width: 100%; height: auto; }
a { color: inherit; }
h1, h2, h3 { font-family: Fredoka, system-ui, sans-serif; font-weight: 600; line-height: 1.08; letter-spacing: -0.01em; margin: 0; text-wrap: balance; }
h1 { font-size: clamp(2.5rem, 5.2vw, 4.1rem); }
h2 { font-size: clamp(1.9rem, 3.4vw, 2.75rem); }
h3 { font-size: 1.45rem; }
p { margin: 0; text-wrap: pretty; }
.wrap { width: min(1180px, 100% - 2.5rem); margin-inline: auto; }
.lede { color: var(--text-2); font-size: 1.15rem; max-width: 34ch; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; border-radius: 6px; }

.button {
  display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 1.6rem;
  border: 0; border-radius: 999px; background: var(--accent); color: var(--on-accent);
  font: 700 1.05rem/1 Nunito, system-ui, sans-serif; text-decoration: none; white-space: nowrap; cursor: pointer;
  transition: transform 0.2s var(--ease), background-color 0.2s var(--ease);
}
.button:hover { background: var(--accent-press); }
.button:active { transform: scale(0.97); }
.button[disabled] { opacity: 0.65; cursor: default; }
.button.small { min-height: 42px; padding: 0 1.15rem; font-size: 0.95rem; }

/* Header */
header { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
.nav { display: flex; align-items: center; gap: 2rem; height: 68px; }
.brand { display: flex; align-items: center; gap: 0.6rem; font: 600 1.2rem/1 Fredoka, system-ui, sans-serif; text-decoration: none; margin-right: auto; white-space: nowrap; }
.brand img { width: 36px; height: 36px; border-radius: 10px; }
.nav-links { display: flex; gap: 1.75rem; font-weight: 700; font-size: 0.98rem; }
.nav-links a { text-decoration: none; color: var(--text-2); transition: color 0.2s var(--ease); }
.nav-links a:hover { color: var(--text); }

/* Hero */
.hero { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); gap: clamp(2rem, 5vw, 4.5rem); align-items: center; min-height: calc(100dvh - 68px); padding-block: 2rem 3.5rem; }
.hero-copy { display: grid; gap: 1.4rem; }
.scene { position: relative; aspect-ratio: 1 / 1.04; max-height: min(620px, 100dvh - 140px); margin-left: auto; width: 100%; border-radius: var(--r-card); overflow: hidden; background: #BFE3F2 url(/img/garden.webp) center / cover; box-shadow: var(--shadow); }
.scene .dragon { position: absolute; left: 50%; bottom: 9%; height: 62%; width: auto; translate: -50% 0; transform-origin: 50% 100%; }
.scene .egg { position: absolute; left: 9%; bottom: 10%; height: 21%; width: auto; }
.scene .flower { position: absolute; right: 8%; bottom: 9%; height: 26%; width: auto; }

/* Waitlist form */
.join { display: grid; gap: 0.6rem; max-width: 30rem; }
.join label.field { font-weight: 700; font-size: 0.95rem; }
.join-row { display: flex; gap: 0.6rem; }
.join input[type="email"] {
  flex: 1; min-width: 0; min-height: 52px; padding: 0 1.1rem; border: 2px solid var(--border); border-radius: var(--r-field);
  background: var(--surface); color: var(--text); font: 400 1.05rem/1 Nunito, system-ui, sans-serif;
  transition: border-color 0.2s var(--ease);
}
.join input[type="email"]::placeholder { color: var(--text-2); opacity: 0.8; }
.join input[type="email"]:focus { outline: none; border-color: var(--accent); }
.join input[aria-invalid="true"] { border-color: var(--danger); }
.check { display: flex; align-items: center; gap: 0.6rem; font-size: 0.98rem; color: var(--text-2); cursor: pointer; }
.check input { width: 20px; height: 20px; accent-color: var(--accent); margin: 0; }
.trap { position: absolute; left: -9999px; }
.status { min-height: 1.6em; font-size: 0.98rem; color: var(--text-2); }
.status[data-kind="error"] { color: var(--danger); font-weight: 700; }
.status[data-kind="done"] { color: var(--text); font-weight: 700; }

section { padding-block: clamp(3.5rem, 8vw, 6.5rem); }
.section-head { display: grid; gap: 0.9rem; margin-bottom: clamp(2rem, 4vw, 3.25rem); }
.section-head .lede { max-width: 46ch; }

/* Growth strip: the dragons stand in one mint band, with the words underneath. */
.stages { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.stages li { display: grid; grid-template-rows: 300px auto; text-align: center; }
.stages .art { display: flex; align-items: flex-end; justify-content: center; background: var(--mint); }
.stages li:first-child .art { border-radius: var(--r-card) 0 0 var(--r-card); }
.stages li:last-child .art { border-radius: 0 var(--r-card) var(--r-card) 0; }
.stages img { width: auto; }
.stages .s1 img { height: 110px; margin-bottom: 22px; } .stages .s2 img { height: 170px; } .stages .s3 img { height: 215px; } .stages .s4 img { height: 270px; }
.stages .words { display: grid; gap: 0.35rem; justify-items: center; align-content: start; padding: 1.25rem 0.75rem 0; }
.stages h3 { font-size: 1.2rem; }
.stages p { color: var(--text-2); font-size: 0.98rem; max-width: 22ch; }

/* What's inside */
.tiles { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); grid-template-rows: auto auto auto; gap: 1.25rem; }
.tile { border-radius: var(--r-card); padding: 2rem; display: grid; gap: 0.6rem; align-content: start; overflow: hidden; }
.tile p { color: var(--text-2); max-width: 36ch; }
.tile.den { grid-row: span 3; padding: 0; background: var(--surface); border: 1px solid var(--border); align-content: stretch; grid-template-rows: 1fr auto; }
.tile.den img { width: 100%; height: 100%; aspect-ratio: 5 / 4; object-fit: cover; object-position: 50% 78%; }
.tile.den .words { padding: 1.75rem 2rem 2rem; display: grid; gap: 0.6rem; }
.tile.garden { background: var(--mint); grid-template-columns: 1fr auto; align-items: end; }
.tile.garden > div:first-child { display: grid; gap: 0.6rem; }
.tile.nudge, .tile.private { align-content: end; min-height: 190px; }
.tile.garden .plants { display: flex; align-items: flex-end; gap: 0.25rem; margin-bottom: -0.5rem; }
.tile.garden .plants img { height: 140px; width: auto; }
.tile.garden .plants img:nth-child(2) { height: 104px; }
.tile.nudge { background: var(--gold); }
.tile.private { background: var(--accent-soft); }
.tile.garden p, .tile.nudge p, .tile.private p { color: var(--text); opacity: 0.82; }

/* Questions */
.faq { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: clamp(2rem, 6vw, 5rem); align-items: start; }
.faq-list { display: grid; gap: 0.75rem; }
details { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 0 1.4rem; }
summary { cursor: pointer; list-style: none; padding: 1.15rem 0; font-weight: 700; display: flex; justify-content: space-between; gap: 1rem; }
summary::-webkit-details-marker { display: none; }
summary::after { content: "+"; font: 600 1.4rem/1 Fredoka, system-ui, sans-serif; color: var(--accent); transition: transform 0.25s var(--ease); }
details[open] summary::after { transform: rotate(45deg); }
details p { color: var(--text-2); padding-bottom: 1.25rem; max-width: 60ch; }

/* Closing band */
.closing { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 2rem; padding: 2rem 2.5rem; border-radius: var(--r-card); background: var(--accent-soft); }
.closing img { height: 150px; width: auto; }
.closing h2 { font-size: clamp(1.6rem, 2.8vw, 2.2rem); }

footer { padding-block: 2.5rem 3rem; color: var(--text-2); font-size: 0.95rem; }
.foot { display: flex; flex-wrap: wrap; gap: 0.75rem 1.75rem; align-items: center; }
.foot span { margin-right: auto; }

/* Motion: a calm load-in for the hero, a slow breath for the dragon, and sections that rise as they arrive. */
@media (prefers-reduced-motion: no-preference) {
  .hero-copy > *, .scene { animation: rise 0.8s var(--ease) both; }
  .hero-copy > :nth-child(2) { animation-delay: 0.08s; }
  .hero-copy > :nth-child(3) { animation-delay: 0.16s; }
  .scene { animation-delay: 0.12s; }
  .scene .dragon { animation: breathe 3.6s ease-in-out infinite; }
  .js .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
  .js .reveal.seen { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
@keyframes rise { from { opacity: 0; transform: translateY(18px); } }
@keyframes breathe { 50% { transform: scale(1.015, 1.03); } }

@media (max-width: 860px) {
  .nav-links { display: none; }
  .hero { grid-template-columns: 1fr; min-height: 0; padding-block: 1.25rem 2.5rem; }
  .scene { order: -1; aspect-ratio: 16 / 11; max-height: 300px; }
  .scene .dragon { height: 78%; bottom: 6%; }
  .lede { max-width: none; }
  .stages { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 1rem; }
  .stages li { grid-template-rows: 200px auto; }
  .stages li .art, .stages li:first-child .art, .stages li:last-child .art { border-radius: 20px; }
  .stages .s1 img { height: 90px; } .stages .s2 img { height: 120px; } .stages .s3 img { height: 150px; } .stages .s4 img { height: 180px; }
  .tiles, .faq { grid-template-columns: 1fr; }
  .tile.den { grid-row: auto; }
  .closing { grid-template-columns: 1fr; justify-items: start; padding: 2rem; }
  .closing img { height: 110px; }
}
@media (max-width: 480px) {
  .join-row { flex-direction: column; }
  .brand span { display: none; }
  .tile.garden { grid-template-columns: 1fr; }
}
</style>
</head>
<body>
<header>
  <div class="wrap nav">
    <a class="brand" href="/"><img src="/img/icon.webp" alt="" width="36" height="36"><span>DragonDen Garden</span></a>
    <nav class="nav-links" aria-label="Sections">
      <a href="#grow">How it grows</a>
      <a href="#inside">What is inside</a>
      <a href="#questions">Questions</a>
    </nav>
    <a class="button small" href="#join">Join the waitlist</a>
  </div>
</header>

<main>
  <div class="wrap hero">
    <div class="hero-copy">
      <h1>Keep your habits. Raise a dragon.</h1>
      <p class="lede">A habit tracker for iPhone where small daily wins hatch an egg, grow a garden and fill a den.</p>
      <form class="join" id="join" action="/waitlist" method="post" novalidate>
        <label class="field" for="email">Email address</label>
        <div class="join-row">
          <input id="email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required aria-describedby="join-status">
          <button class="button" type="submit">Join the waitlist</button>
        </div>
        <label class="check"><input type="checkbox" name="newsletter"> Also send me occasional garden news</label>
        <label class="trap" aria-hidden="true">Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
        <p class="status" id="join-status" role="status" aria-live="polite">One email when it reaches the App Store.</p>
      </form>
    </div>
    <div class="scene">
      <img class="egg" src="/img/egg.webp" alt="" width="225" height="300">
      <img class="flower" src="/img/cherry-bloom.webp" alt="" width="177" height="260">
      <img class="dragon" src="/img/grown-happy.webp" alt="A smiling lavender dragon standing in a sunny garden" width="359" height="520">
    </div>
  </div>

  <section id="grow">
    <div class="wrap">
      <div class="section-head reveal">
        <h2>From egg to grown dragon</h2>
        <p class="lede">You choose the egg. Your habits do the rest.</p>
      </div>
      <ol class="stages reveal">
        <li class="s1"><div class="art"><img src="/img/egg.webp" alt="A speckled lavender egg" width="225" height="300" loading="lazy"></div><div class="words"><h3>Pick an egg</h3><p>Lavender or sky blue. A short quiz picks your first habits.</p></div></li>
        <li class="s2"><div class="art"><img src="/img/young.webp" alt="A small young dragon" width="258" height="420" loading="lazy"></div><div class="words"><h3>It hatches</h3><p>Name your dragon and start with three to five tiny habits.</p></div></li>
        <li class="s3"><div class="art"><img src="/img/teen.webp" alt="A teenage dragon with small wings" width="376" height="460" loading="lazy"></div><div class="words"><h3>It grows up</h3><p>Days you show up turn into growth you can see.</p></div></li>
        <li class="s4"><div class="art"><img src="/img/grown.webp" alt="A grown dragon standing proudly" width="441" height="640" loading="lazy"></div><div class="words"><h3>Fully grown</h3><p>A companion that remembers the days you kept going.</p></div></li>
      </ol>
    </div>
  </section>

  <section id="inside">
    <div class="wrap">
      <div class="section-head reveal">
        <h2>More than a checklist</h2>
      </div>
      <div class="tiles">
        <article class="tile den reveal">
          <img src="/img/den.webp" alt="A dragon sitting in a bed inside a round wooden den with a lamp beside it" width="900" height="900" loading="lazy">
          <div class="words">
            <h3>A den to make your own</h3>
            <p>Earn diamonds on journeys and spend them on a bed, a lamp, a rug and more.</p>
          </div>
        </article>
        <article class="tile garden reveal">
          <div>
            <h3>A garden that blooms</h3>
            <p>Plant seeds and watch each one go from sprout to flower.</p>
          </div>
          <div class="plants" aria-hidden="true">
            <img src="/img/lavender-bloom.webp" alt="" width="123" height="260" loading="lazy">
            <img src="/img/bellflower-budding.webp" alt="" width="133" height="260" loading="lazy">
            <img src="/img/daisy-bloom.webp" alt="" width="166" height="260" loading="lazy">
          </div>
        </article>
        <article class="tile nudge reveal">
          <h3>A nudge at the right time</h3>
          <p>Each habit gets its own reminder, spaced out so your phone stays calm.</p>
        </article>
        <article class="tile private reveal">
          <h3>Yours, and private</h3>
          <p>No ads, no tracking and no account needed. Your habits stay on your phone.</p>
        </article>
      </div>
    </div>
  </section>

  <section id="questions">
    <div class="wrap faq">
      <div class="section-head reveal">
        <h2>Questions</h2>
        <p class="lede">The short answers, before you sign up.</p>
      </div>
      <div class="faq-list reveal">
        ${faq}
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="closing reveal">
        <img src="/img/young.webp" alt="" width="258" height="420" loading="lazy">
        <h2>Your egg is waiting.</h2>
        <a class="button" href="#join">Join the waitlist</a>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap foot">
    <span>&copy; 2026 DragonDen Garden</span>
    <a href="/privacy">Privacy</a>
    <a href="/support">Support</a>
  </div>
</footer>

<script>
(function () {
  document.documentElement.classList.add('js');

  // Sections rise into place the first time they come into view.
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (el) { seen.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('seen'); });
  }

  // The form sends in place, so nobody leaves the page to join.
  var form = document.getElementById('join');
  var email = document.getElementById('email');
  var status = document.getElementById('join-status');
  var button = form.querySelector('button');
  function say(kind, text) { status.dataset.kind = kind; status.textContent = text; }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = email.value.trim();
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(value)) {
      email.setAttribute('aria-invalid', 'true');
      say('error', 'That email address does not look right.');
      email.focus();
      return;
    }
    email.removeAttribute('aria-invalid');
    button.disabled = true;
    button.textContent = 'Joining…';
    say('', 'One moment.');
    fetch('/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value, newsletter: form.newsletter.checked, website: form.website.value })
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.data.error || '');
        form.reset();
        button.textContent = 'You are in';
        say('done', r.data.message);
      })
      .catch(function (err) {
        button.disabled = false;
        button.textContent = 'Join the waitlist';
        say('error', err.message || 'That did not go through. Please try again.');
      });
  });
})();
</script>
</body>
</html>`;
}
