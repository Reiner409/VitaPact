import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY, cspMetaTag } from './csp';

const directives = new Map(
  CONTENT_SECURITY_POLICY.split(';').map((directive) => {
    const [name, ...sources] = directive.trim().split(/\s+/);
    return [name!, sources];
  }),
);

describe('F1-07 RNF-01 Content Security Policy', () => {
  it('allows connections only to the Tauri IPC channel', () => {
    expect(directives.get('connect-src')).toEqual(['ipc:', 'http://ipc.localhost']);
  });

  it('loads scripts only from the app itself', () => {
    expect(directives.get('script-src')).toEqual(["'self'"]);
    expect(directives.get('default-src')).toEqual(["'self'"]);
  });

  it('loads fonts only from the app bundle', () => {
    expect(directives.get('font-src')).toEqual(["'self'", 'data:']);
  });

  it('contains no remote origin anywhere except the IPC host', () => {
    const remoteSources = [...directives.values()]
      .flat()
      .filter((source) => /^(https?:|wss?:|\*)/.test(source) && source !== 'http://ipc.localhost');
    expect(remoteSources).toEqual([]);
  });

  it('blocks plugins, frames, forms and base URL changes', () => {
    for (const name of ['object-src', 'frame-src', 'base-uri', 'form-action']) {
      expect(directives.get(name)).toEqual(["'none'"]);
    }
  });

  it('renders a meta tag for the web build', () => {
    expect(cspMetaTag()).toBe(
      `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`,
    );
  });
});
