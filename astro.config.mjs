import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  build: {
    assets: 'assets'
  },
  vite: {
    ssr: {
      noExternal: ['chart.js']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'chart': ['chart.js']
          }
        }
      }
    }
  }
});
