// @ts-check
import { defineConfig } from 'astro/config';

// Static-first build for Cloudflare Pages. No adapter: every page is prerendered.
export default defineConfig({
  site: 'https://line12-tracker.pages.dev',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
});
