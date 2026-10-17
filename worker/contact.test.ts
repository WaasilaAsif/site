// Run: node --experimental-strip-types --test worker/contact.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkContact, parseRecipients } from './contact.ts';

test('accepts a normal message', () => {
  const r = checkContact({ name: 'Sana', email: 'Sana@Example.com', message: 'Loved the fork() post.' });
  assert.deepEqual(r, { ok: true, value: { name: 'Sana', email: 'sana@example.com', message: 'Loved the fork() post.' } });
});

test('name and email are optional', () => {
  const r = checkContact({ message: 'hello there' });
  assert.equal(r.ok, true);
});

test('strips CR/LF from header fields (header injection)', () => {
  const r = checkContact({ name: 'x\r\nBcc: victim@evil.com', email: 'a@b.co', message: 'hello there' });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.name.includes('\n') || r.value.name.includes('\r'), false);
});

test('rejects an email carrying an injected header', () => {
  const r = checkContact({ email: 'a@b.co\r\nBcc: c@d.co', message: 'hello there' });
  assert.equal(r.ok, false);
});

test('rejects malformed email', () => {
  assert.equal(checkContact({ email: 'not-an-email', message: 'hello there' }).ok, false);
});

test('rejects empty and oversized messages', () => {
  assert.equal(checkContact({ message: '   ' }).ok, false);
  assert.equal(checkContact({ message: 'a'.repeat(4001) }).ok, false);
});

test('keeps newlines in the body, drops other control chars', () => {
  const r = checkContact({ message: 'line one\r\nline two\u0007' });
  assert.equal(r.ok && r.value.message, 'line one\nline two');
});

test('non-string input is treated as empty', () => {
  assert.equal(checkContact({ message: ['array'] as unknown as string }).ok, false);
});

test('parses the recipient list, dropping junk', () => {
  assert.deepEqual(parseRecipients(' a@x.com, b@y.org ,nope, c@z.pk'), ['a@x.com', 'b@y.org', 'c@z.pk']);
  assert.deepEqual(parseRecipients(undefined), []);
});
