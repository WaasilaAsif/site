import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'>;

// Drafts show up in `npm run dev` so you can preview them, never in the build.
export async function getPosts(kind?: 'technical' | 'notes') {
  const all = await getCollection('writing', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return all
    .filter((p) => !kind || p.data.kind === kind)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postHref = (p: Post) => p.data.external ?? `/writing/${p.id}/`;

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function readingMinutes(p: Post) {
  if (p.data.readingTime) return p.data.readingTime;
  const words = (p.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
