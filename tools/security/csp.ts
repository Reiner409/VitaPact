/**
 * Content Security Policy of VitaPact (RNF-01, F1-07): the app can open no network connection.
 * Only Tauri's own IPC channel is allowed in connect-src. The same string is used by
 * src-tauri/tauri.conf.json and injected as a <meta> tag into the web build.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  // Mantine sets inline styles at runtime.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  'connect-src ipc: http://ipc.localhost',
  "media-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "worker-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

export function cspMetaTag(policy: string = CONTENT_SECURITY_POLICY): string {
  return `<meta http-equiv="Content-Security-Policy" content="${policy}" />`;
}
