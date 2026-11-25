import { Hono } from 'hono';

import { env } from '../env.js';
import { landingPage } from '../site/landing.js';

/** The public website: the home page and the two files search engines ask for. */
export const siteRoutes = new Hono();

const home = landingPage(env.siteUrl);

siteRoutes.get('/', (c) => {
  c.header('Cache-Control', 'public, max-age=300');
  return c.html(home);
});

siteRoutes.get('/robots.txt', (c) =>
  c.text(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /v1/\nDisallow: /admin/\nSitemap: ${env.siteUrl}/sitemap.xml\n`),
);

siteRoutes.get('/sitemap.xml', (c) => {
  const urls = ['/', '/privacy', '/support'].map((p) => `<url><loc>${env.siteUrl}${p}</loc></url>`).join('');
  c.header('Content-Type', 'application/xml; charset=utf-8');
  return c.body(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});
