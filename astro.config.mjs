import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://xmzhangai.github.io',
  output: 'static',
  build: {
    assets: '_assets'
  },
  vite: {
    build: {
      cssMinify: 'lightningcss'
    }
  }
});
