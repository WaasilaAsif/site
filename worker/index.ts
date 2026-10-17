// Cloudflare Worker: serves the static site from ./dist and handles /api/*.
// Only /api/* reaches this code (see run_worker_first in wrangler.jsonc);
// every other request is served straight from the static assets.
import { checkContact, parseRecipients } from './contact.ts';

interface Env {
  ASSETS: Fetcher;
  EMAIL: { send(msg: unknown): Promise<unknown> };
  CONTACT_TO: string;        // secret: "a@x.com,b@y.com,c@z.com"
  CONTACT_FROM: string;      // var: an address on your domain, e.g. "site@yourdomain.com"
  TURNSTILE_SECRET: string;  // secret
}

const MAX_BODY = 16 * 1024;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function verifyTurnstile(token: string, ip: string | null, secret: string) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = (await res.json()) as { success?: boolean };
  return out.success === true;
}

async function contact(req: Request, env: Env, url: URL): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Send the form with POST.' }, 405);

  // Only accept submissions from our own pages.
  const origin = req.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'Cross-site submissions aren’t accepted.' }, 403);

  const len = Number(req.headers.get('content-length') ?? '0');
  if (len > MAX_BODY) return json({ error: 'That message is too long.' }, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'The form data couldn’t be read. Reload the page and try again.' }, 400);
  }
  const field = (k: string) => {
    const v = form.get(k);
    return typeof v === 'string' ? v : '';
  };

  // Honeypot: a field humans never see. Bots fill it; pretend it worked.
  if (field('website')) return json({ ok: true });

  const human = await verifyTurnstile(field('cf-turnstile-response'), req.headers.get('cf-connecting-ip'), env.TURNSTILE_SECRET);
  if (!human) return json({ error: 'The spam check didn’t pass. Wait for it to finish, then send again.' }, 400);

  const checked = checkContact({ name: field('name'), email: field('email'), message: field('message') });
  if (!checked.ok) return json({ error: checked.error, field: checked.field }, 400);
  const { name, email, message } = checked.value;

  const [to, ...cc] = parseRecipients(env.CONTACT_TO);
  if (!to) return json({ error: 'The contact form isn’t set up yet.' }, 503);

  try {
    await env.EMAIL.send({
      from: { email: env.CONTACT_FROM, name: 'Website contact form' },
      to,
      cc: cc.length ? cc : undefined,
      replyTo: email ? { email, name: name || undefined } : undefined,
      subject: `Message from ${name || 'someone'} via your site`.slice(0, 140),
      text: `${message}\n\n--\nFrom: ${name || '(no name)'}\nReply to: ${email || '(no email given)'}\n`,
    });
  } catch (err) {
    console.error('contact send failed', err);
    return json({ error: 'The message couldn’t be sent right now. Try again in a few minutes.' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/contact') return contact(req, env, url);
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    return env.ASSETS.fetch(req);
  },
};
