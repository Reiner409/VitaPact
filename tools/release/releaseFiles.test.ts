import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listRepoFiles, REPO_ROOT } from '../lib/files';

const readRepoFile = (path: string) => readFileSync(join(REPO_ROOT, path), 'utf8');

const appVersion = (): string => JSON.parse(readRepoFile('src-tauri/tauri.conf.json')).version;

describe('F4-03 D27 the repository carries the GPL-3.0 licence', () => {
  it('LICENSE holds the full GNU GPL version 3 text', () => {
    const licence = readRepoFile('LICENSE');
    expect(licence).toContain('GNU GENERAL PUBLIC LICENSE');
    expect(licence).toContain('Version 3, 29 June 2007');
    expect(licence).toContain('END OF TERMS AND CONDITIONS');
  });

  it('the root package and the installer declare GPL-3.0-only', () => {
    expect(JSON.parse(readRepoFile('package.json')).license).toBe('GPL-3.0-only');
    expect(JSON.parse(readRepoFile('src-tauri/tauri.conf.json')).bundle.license).toBe(
      'GPL-3.0-only',
    );
  });
});

describe('F4-03 every part of the app carries the release version', () => {
  it('each package.json matches the Tauri version', () => {
    const manifests = listRepoFiles(['.'], (path) => path.endsWith('package.json'));
    expect(manifests.length).toBeGreaterThan(1);
    for (const manifest of manifests) {
      expect({ manifest, version: JSON.parse(readRepoFile(manifest)).version }).toEqual({
        manifest,
        version: appVersion(),
      });
    }
  });

  it('the Rust shell matches the Tauri version', () => {
    expect(readRepoFile('src-tauri/Cargo.toml')).toMatch(
      new RegExp(`^version = "${appVersion()}"$`, 'm'),
    );
    expect(readRepoFile('src-tauri/Cargo.lock')).toContain(
      `name = "vitapact"\nversion = "${appVersion()}"`,
    );
  });

  it('the changelog has a section for the version, which the release uses as its notes', () => {
    expect(readRepoFile('CHANGELOG.md')).toMatch(new RegExp(`^## ${appVersion()} · `, 'm'));
  });
});
