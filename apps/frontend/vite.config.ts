import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point @poker/shared directly to source so Vite handles it natively
      // — no need to rebuild dist when shared types change
      '@poker/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
