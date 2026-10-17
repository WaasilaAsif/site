// Pure validation for the contact form. No Cloudflare APIs here, so it can be
// unit-tested with plain Node (see worker/contact.test.ts).

export const LIMITS = { name: 80, email: 254, message: 4000, minMessage: 5 };

export type ContactInput = { name: string; email: string; message: string };
export type Checked =
  | { ok: true; value: ContactInput }
  | { ok: false; field: 'name' | 'email' | 'message'; error: string };

// Header fields (name, email) must be single-line: CR/LF there is how header
// injection works. Strip every control character from them.
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
// The body may keep newlines and tabs, nothing else from the control range.
const body = (s: string) => s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim();

// Deliberately simple. Real validation is "does a reply arrive".
const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

export function checkContact(raw: Record<string, unknown>): Checked {
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');
  const name = oneLine(str('name'));
  const email = oneLine(str('email')).toLowerCase();
  const message = body(str('message'));

  if (name.length > LIMITS.name) return { ok: false, field: 'name', error: `Keep your name under ${LIMITS.name} characters.` };
  if (email && (email.length > LIMITS.email || !EMAIL.test(email)))
    return { ok: false, field: 'email', error: 'That email address doesn’t look right. Check it, or leave it blank.' };
  if (message.length < LIMITS.minMessage) return { ok: false, field: 'message', error: 'Write a message first.' };
  if (message.length > LIMITS.message)
    return { ok: false, field: 'message', error: `Keep the message under ${LIMITS.message} characters.` };

  return { ok: true, value: { name, email, message } };
}

// "a@x.com, b@y.com,c@z.com" -> ['a@x.com', 'b@y.com', 'c@z.com']
export const parseRecipients = (s: string | undefined) =>
  (s ?? '').split(',').map((x) => x.trim()).filter((x) => EMAIL.test(x));
