// @ts-check
import { defineConfig } from 'astro/config';

/** `astro dev` only: /preview/<line>/ shows a line that has no pages yet. Kept out of src/pages so the build is unchanged. */
const linePreview = {
  name: 'line-preview',
  hooks: {
    /** @param {{ command: string, injectRoute: (r: { pattern: string, entrypoint: string }) => void }} opts */
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') injectRoute({ pattern: '/preview/[line]', entrypoint: './src/preview/[line].astro' });
    },
  },
};

// Static-first build for Cloudflare Pages. No adapter: every page is prerendered.
export default defineConfig({
  site: 'https://line12-tracker.pages.dev',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  integrations: [linePreview],
});
