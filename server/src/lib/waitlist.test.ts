import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanEmail, csvCell, isYes, rateLimiter } from './waitlist.js';

test('cleanEmail trims and lower-cases a real address', () => {
  assert.equal(cleanEmail('  Mira@Example.COM '), 'mira@example.com');
});

test('cleanEmail rejects things that are not addresses', () => {
  for (const bad of ['', 'mira', 'mira@', 'mira@example', 'a b@example.com', 42, null, `${'a'.repeat(250)}@x.io`]) {
    assert.equal(cleanEmail(bad), null);
  }
});

test('isYes accepts checkbox and JSON forms of yes only', () => {
  assert.equal(isYes('on'), true);
  assert.equal(isYes(true), true);
  assert.equal(isYes('no'), false);
  assert.equal(isYes(undefined), false);
});

test('rateLimiter blocks after the limit and recovers after the window', () => {
  let t = 0;
  const allow = rateLimiter(2, 1000, () => t);
  assert.equal(allow('ip'), true);
  assert.equal(allow('ip'), true);
  assert.equal(allow('ip'), false);
  assert.equal(allow('other'), true);
  t = 1001;
  assert.equal(allow('ip'), true);
});

test('csvCell quotes and defuses formulas', () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell('=SUM(A1)'), `"'=SUM(A1)"`);
});
