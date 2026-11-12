import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173 },
  css: {
    modules: {
      // Readable class names in dev (Button_solid__ab12), short hashes in production builds.
      generateScopedName: mode === 'production' ? '[hash:base64:6]' : '[name]_[local]__[hash:base64:4]',
    },
  },
}));
