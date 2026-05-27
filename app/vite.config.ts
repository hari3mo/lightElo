import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// COOP/COEP headers are required for SharedArrayBuffer, which Stockfish's
// multi-threaded WASM build depends on.
const crossOriginIsolation = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: crossOriginIsolation,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/predict': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      headers: crossOriginIsolation,
    },
  };
});
