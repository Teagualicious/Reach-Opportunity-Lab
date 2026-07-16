import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/Reach-Opportunity-Lab/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: mode === 'offline-review' ? 'offline.html' : 'index.html',
      // The offline review package must remain a single inlinable module script,
      // so the MapLibre vendor chunk applies to standard builds only.
      output:
        mode === 'offline-review'
          ? {}
          : { manualChunks: { maplibre: ['maplibre-gl'] } },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
}));
