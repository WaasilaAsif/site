import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Change `site` once the domain is bought. RSS, sitemap and canonical URLs
// all read from here.
export default defineConfig({
  site: 'https://waasila.pages.dev',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
    },
  },
});
