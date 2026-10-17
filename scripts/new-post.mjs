// Usage: npm run new -- "Post title" [notes]
// Creates src/content/writing/<slug>.md as a draft and prints its path.
import { writeFileSync, existsSync } from 'node:fs';

const [title, kindArg] = process.argv.slice(2);
if (!title) {
  console.error('Give the post a title: npm run new -- "How ELF relocations work"');
  process.exit(1);
}
const kind = kindArg === 'notes' ? 'notes' : 'technical';
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const path = `src/content/writing/${slug}.md`;
if (existsSync(path)) {
  console.error(`${path} already exists.`);
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  path,
  `---
title: ${JSON.stringify(title)}
description: ""
date: ${today}
kind: ${kind}
tags: []
draft: true
---

`,
);
console.log(`Created ${path} (draft). Set draft: false to publish.`);
