// End-to-end test of the Worker with Turnstile and email mocked.
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.ts';

function setup(turnstileOk = true) {
  const sent: any[] = [];
  globalThis.fetch = (async () => new Response(JSON.stringify({ success: turnstileOk }))) as any;
  const env = {
    ASSETS: { fetch: async () => new Response('static') },
    EMAIL: { send: async (m: unknown) => { sent.push(m); } },
    CONTACT_TO: 'me@a.com, me@b.com, me@c.com',
    CONTACT_FROM: 'site@example.com',
    TURNSTILE_SECRET: 'x',
  };
  return { env, sent };
}
const post = (fields: Record<string, string>, origin = 'https://site.test') => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new Request('https://site.test/api/contact', { method: 'POST', body: fd, headers: { origin } });
};

test('sends to the first address and CCs the rest, reply-to the visitor', async () => {
  const { env, sent } = setup();
  const res = await worker.fetch(post({ name: 'Sana', email: 'sana@x.com', message: 'hello!', 'cf-turnstile-response': 't' }), env as any);
  assert.equal(res.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'me@a.com');
  assert.deepEqual(sent[0].cc, ['me@b.com', 'me@c.com']);
  assert.deepEqual(sent[0].replyTo, { email: 'sana@x.com', name: 'Sana' });
});

test('honeypot filled: says ok, sends nothing', async () => {
  const { env, sent } = setup();
  const res = await worker.fetch(post({ message: 'buy now', website: 'spam.com' }), env as any);
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test('failed Turnstile: rejected, nothing sent', async () => {
  const { env, sent } = setup(false);
  const res = await worker.fetch(post({ message: 'hello there', 'cf-turnstile-response': 't' }), env as any);
  assert.equal(res.status, 400);
  assert.equal(sent.length, 0);
});

test('other-origin post: rejected', async () => {
  const { env, sent } = setup();
  const res = await worker.fetch(post({ message: 'hello there', 'cf-turnstile-response': 't' }, 'https://evil.test'), env as any);
  assert.equal(res.status, 403);
  assert.equal(sent.length, 0);
});

test('GET is refused; pages fall through to static assets', async () => {
  const { env } = setup();
  assert.equal((await worker.fetch(new Request('https://site.test/api/contact'), env as any)).status, 405);
  assert.equal(await (await worker.fetch(new Request('https://site.test/about/'), env as any)).text(), 'static');
});
