// Dev-only asset generator for the Higgsfield API. Never import this from app code:
// the key must stay on this machine, not in the app bundle.
//
// Usage:
//   node --env-file=.env.local scripts/higgsfield.mjs <endpoint> <input.json> <out-dir> [--ref <local-image>]... [--image <field>=<local-image>]...
//
// Example:
//   node --env-file=.env.local scripts/higgsfield.mjs xai/grok-imagine-image-2.0 \
//     assets/prompts/dragon-sheet.json assets/generated/dragon-sheet
//
// Credentials in .env.local (gitignored): HF_CREDENTIALS=key-id:key-secret.
// Local --ref images are uploaded and appended to the input's image_urls.
// --image uploads a local image into a single field, e.g. --image image_url=start.png.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const API = 'https://api.higgsfield.ai';
const TERMINAL = new Set(['completed', 'failed', 'nsfw', 'canceled']);
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

const { HF_CREDENTIALS } = process.env;
if (!HF_CREDENTIALS?.includes(':')) {
  console.error('Missing HF_CREDENTIALS (key-id:key-secret). Put it in .env.local.');
  process.exit(1);
}
const auth = { Authorization: `Key ${HF_CREDENTIALS}` };

const args = process.argv.slice(2);
const refs = [];
for (let i = args.indexOf('--ref'); i !== -1; i = args.indexOf('--ref')) {
  refs.push(args[i + 1]);
  args.splice(i, 2);
}
const fields = [];
for (let i = args.indexOf('--image'); i !== -1; i = args.indexOf('--image')) {
  const [field, file] = args[i + 1].split('=');
  fields.push({ field, file });
  args.splice(i, 2);
}
const [endpoint, inputPath, outDir] = args;
if (!endpoint || !inputPath || !outDir) {
  console.error('Usage: scripts/higgsfield.mjs <endpoint> <input.json> <out-dir> [--ref <image>]...');
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(path.startsWith('http') ? path : `${API}/${path}`, {
    ...init,
    headers: { ...auth, 'Content-Type': 'application/json', ...init.headers },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${body}`);
  return body ? JSON.parse(body) : {};
}

async function upload(file) {
  const contentType = MIME[extname(file).toLowerCase()];
  if (!contentType) throw new Error(`Unsupported reference type: ${file}`);
  const target = await api('files/generate-upload-url', {
    method: 'POST',
    body: JSON.stringify({ content_type: contentType }),
  });
  // The presigned URL must not receive our credentials.
  const res = await fetch(target.upload_url, {
    method: 'PUT',
    headers: target.upload_headers,
    body: await readFile(file),
  });
  if (!res.ok) throw new Error(`Upload failed for ${file}: ${res.status}`);
  return target.public_url;
}

const input = JSON.parse(await readFile(inputPath, 'utf8'));
if (refs.length) {
  input.image_urls = [...(input.image_urls ?? []), ...(await Promise.all(refs.map(upload)))];
}
for (const { field, file } of fields) input[field] = await upload(file);

const submitted = await api(endpoint, { method: 'POST', body: JSON.stringify(input) });
console.log(`Submitted ${submitted.request_id}`);

let result = submitted;
let delay = 2000;
while (!TERMINAL.has(result.status)) {
  await new Promise((r) => setTimeout(r, delay + Math.random() * 500));
  delay = Math.min(delay * 1.5, 10000);
  result = await api(submitted.status_url);
  process.stdout.write(`  ${result.status}\n`);
}
if (result.status !== 'completed') {
  console.error(`Request ended as ${result.status}`, result.error ?? '');
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
const urls = [...(result.images ?? []).map((i) => i.url), result.video?.url].filter(Boolean);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
for (const [i, url] of urls.entries()) {
  const ext = extname(new URL(url).pathname) || '.bin';
  const file = join(outDir, `${basename(outDir)}-${stamp}-${i + 1}${ext}`);
  await writeFile(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
  console.log(`Saved ${file}`);
}
await writeFile(
  join(outDir, `${basename(outDir)}-${stamp}.json`),
  JSON.stringify({ endpoint, input, request_id: submitted.request_id, urls }, null, 2),
);
