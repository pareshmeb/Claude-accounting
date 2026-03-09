import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { transformSync } from 'esbuild';

export default defineConfig({
  plugins: [
    {
      name: 'js-jsx-transform',
      enforce: 'pre',
      transform(code, id) {
        if (/\.(js)$/.test(id) && !id.includes('node_modules') && code.includes('<')) {
          const result = transformSync(code, {
            loader: 'jsx',
            jsx: 'automatic',
            sourcefile: id,
            sourcemap: true,
          });
          return { code: result.code, map: result.map };
        }
      },
    },
    react({ include: /\.(js|jsx)$/ }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/app/globals.css',
        'src/app/layout.js',
        'src/lib/db.js',
      ],
    },
  },
});
