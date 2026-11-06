import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Vite's built-in esbuild JSX transform keeps the dev server independent of
  // the optional SWC native binding (which can be unavailable on Windows).
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
