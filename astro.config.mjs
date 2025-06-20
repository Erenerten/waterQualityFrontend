import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  build: {
    assets: 'assets'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://ehmsukalitesi.online',
        changeOrigin: true,
        secure: true
      }
    }
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
