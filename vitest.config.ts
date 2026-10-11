import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const domPackages = ['app/**', 'screens/**', 'shared/**'];
const nodePackages = ['core/**', 'platform/**', 'tools/**', 'src-tauri/**', 'e2e/support/**'];
const testFiles = (roots: string[]) => roots.map((root) => `${root}/*.test.{ts,tsx}`);

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: testFiles(domPackages),
          setupFiles: ['./tools/test/setup-dom.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [...testFiles(nodePackages), '*.test.ts'],
        },
      },
    ],
    exclude: ['**/node_modules/**', 'e2e/*.spec.ts', 'tools/boundaries/fixtures/**'],
  },
});
