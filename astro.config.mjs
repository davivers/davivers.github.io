import { defineConfig } from 'astro/config';

// `site` is the public URL (used by RSS and canonical links).
// If the repo is NOT named <user>.github.io, also set the BASE_PATH
// env var (or `base`) to '/<repo-name>'.
export default defineConfig({
  site: 'https://davivers.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },
});
