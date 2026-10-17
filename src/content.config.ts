import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One collection for everything you write.
//   kind: 'technical' -> deep dives, writeups, CTF solutions
//   kind: 'notes'     -> personal posts, reflections, monthly logs
// `external` = the canonical copy lives elsewhere (Medium). The entry shows in
// your list and links out; no body needed.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    kind: z.enum(['technical', 'notes']).default('technical'),
    tags: z.array(z.string()).default([]),
    external: z.string().url().optional(),
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
