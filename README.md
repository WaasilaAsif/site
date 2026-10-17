# waasila-site

Personal site and blog. Astro, static output, deployed on Cloudflare Workers.

## Run it

```sh
npm install
npm run dev        # http://localhost:4321, drafts visible
npm run build      # outputs dist/, drafts excluded
```

## Write a post

```sh
npm run new -- "How ELF relocations work"          # technical post
npm run new -- "October, briefly" notes             # personal note
```

That creates `src/content/writing/<slug>.md` with `draft: true`. Write, preview with
`npm run dev`, then set `draft: false` and push.

Frontmatter fields:

| field         | what it does                                                        |
|---------------|---------------------------------------------------------------------|
| `kind`        | `technical` or `notes`; decides which list it appears in            |
| `external`    | URL of the canonical copy (Medium, dev.to). Entry links out, no body |
| `readingTime` | override the computed minutes (useful for external posts)           |
| `updated`     | shows "updated <date>" under the title                               |
| `draft`       | `true` hides it from the built site                                  |

Footnotes use `[^1]` syntax. Rename a file to `.mdx` to import components into a post
(interactive figures, custom diagrams).

## Where to edit things

- `src/site.ts`: name, links, the hexdump text, the projects list
- `src/data/bookmarks.ts`: bookmarks page
- `src/pages/about.astro`: about page (rewrite in your own voice)
- `src/styles/global.css`: colours and type, all tokens at the top

## Deploy (Cloudflare Workers)

The site is static files plus one small Worker for `/api/*` (the contact form now,
the garden later). Pages are served straight from `dist/`; only API calls run code.

1. `npx wrangler login`
2. `npm run deploy`. You get `waasila-site.<you>.workers.dev` straight away.
   The contact form won't send until step 3 is done; everything else works.
3. Once you own a domain on Cloudflare:
   - Add it to the Worker: dashboard → Workers → waasila-site → Settings → Domains.
   - Turn on **Email Routing** for the domain, and add your 3 inboxes as
     **destination addresses**. Each one gets a verification email; click all three.
   - Set `CONTACT_FROM` in `wrangler.jsonc` to an address on the domain,
     e.g. `site@yourdomain.com`.
   - Create a **Turnstile** widget (dashboard → Turnstile) for the domain. Put the
     site key in `.env` as `PUBLIC_TURNSTILE_SITE_KEY=...`.
   - Set the secrets (these never go in git):
     ```sh
     npx wrangler secret put CONTACT_TO        # a@x.com,b@y.com,c@z.com  (first = To, rest = CC)
     npx wrangler secret put TURNSTILE_SECRET
     ```
   - `npm run deploy` again, then send yourself a test message.

Sending to your own verified addresses is free on the Workers free plan.

## Contact form security

- Your addresses are never in the page or the repo; only the `CONTACT_TO` secret.
- The email binding can only deliver to addresses you verified, so even if the
  Worker were abused it can't spam anyone else.
- Turnstile (server-side verified) + a honeypot field for bots.
- Same-origin check, 16 KB body cap, length limits on every field.
- Name and email are stripped of control characters (blocks header injection);
  the visitor's email goes in Reply-To, never From.
- Tests: `npm test` (validation + the Worker with email and Turnstile mocked).

## TODO before going public

- [ ] Real publish dates for the two existing articles (`src/content/writing/*.md`)
- [ ] The for-loop article's own URL (currently points at the Medium profile)
- [ ] LinkedIn URL in `src/site.ts`
- [ ] Rewrite `about.astro` and `hello-world.md` in your own words
- [ ] Notes on the bookmarks you want to keep
- [ ] Domain + Email Routing + Turnstile (see Deploy step 3) so the contact form sends
