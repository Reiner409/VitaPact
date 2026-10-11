import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { cspMetaTag } from '../tools/security/csp.ts';

/** Adds the app's Content Security Policy to the built index.html (F1-07). */
function contentSecurityPolicy(): Plugin {
  return {
    name: 'vitapact-csp',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${cspMetaTag()}`),
  };
}

export default defineConfig({
  plugins: [react(), contentSecurityPolicy()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  preview: { port: 4173, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    modulePreload: { polyfill: false },
  },
});
