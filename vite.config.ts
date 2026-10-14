import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function posthogProxy() {
  return {
    '/ingest/static': {
      target: 'https://us-assets.i.posthog.com',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/ingest/, ''),
    },
    '/ingest': {
      target: 'https://us.i.posthog.com',
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/ingest/, ''),
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Local stand-in for the vercel.json /ingest rewrite (only used when
  // VITE_POSTHOG_DEV=1 turns analytics on outside production).
  server: { proxy: posthogProxy() },
  preview: { proxy: posthogProxy() },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
