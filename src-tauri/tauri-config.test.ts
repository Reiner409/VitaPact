import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY } from '../tools/security/csp';

const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const config = readJson('./tauri.conf.json');
const capability = readJson('./capabilities/default.json');

/** Saving and opening files are the only system access VitaPact may have (section 7, F1-01). */
const ALLOWED_PERMISSIONS = [
  'core:default',
  'dialog:allow-open',
  'dialog:allow-save',
  'fs:allow-read-file',
  'fs:allow-write-file',
];

describe('F1-01 Tauri shell', () => {
  it('uses the identifier com.vitapact.app', () => {
    expect(config.identifier).toBe('com.vitapact.app');
  });

  it('opens a window no smaller than 1024 x 700 (section 5)', () => {
    expect(config.app.windows[0]).toMatchObject({ minWidth: 1024, minHeight: 700 });
  });

  it('RF-24 installs for the current user only, without administrator rights', () => {
    expect(config.bundle.windows.nsis.installMode).toBe('currentUser');
  });

  it('RF-24 ships no MSI target, which would need administrator rights', () => {
    expect(config.bundle.targets).not.toContain('msi');
  });

  it('grants only the allowed permissions', () => {
    for (const permission of capability.permissions)
      expect(ALLOWED_PERMISSIONS).toContain(permission);
  });

  it('applies the default capability only', () => {
    expect(config.app.security.capabilities).toEqual(['default']);
  });
});

describe('F1-07 RNF-01 Content Security Policy', () => {
  it('Tauri uses the shared policy', () => {
    expect(config.app.security.csp).toBe(CONTENT_SECURITY_POLICY);
  });
});
