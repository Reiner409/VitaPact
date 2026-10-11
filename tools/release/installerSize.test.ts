import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findInstallers, MAX_INSTALLER_BYTES, oversizedInstallers } from './installerSize';

describe('RNF-09 installer size check', () => {
  it('limit is 15 MB', () => {
    expect(MAX_INSTALLER_BYTES).toBe(15 * 1024 * 1024);
  });

  it('finds .exe and .msi files in nested bundle folders', () => {
    const directory = mkdtempSync(join(tmpdir(), 'bundle-'));
    mkdirSync(join(directory, 'nsis'));
    writeFileSync(join(directory, 'nsis', 'VitaPact_0.1.0_x64-setup.exe'), 'x'.repeat(10));
    writeFileSync(join(directory, 'notes.txt'), 'ignored');
    expect(findInstallers(directory)).toEqual([
      { path: join(directory, 'nsis', 'VitaPact_0.1.0_x64-setup.exe'), bytes: 10 },
    ]);
  });

  it('flags installers at or over the limit only', () => {
    const installers = [
      { path: 'small.exe', bytes: 9 },
      { path: 'exact.exe', bytes: 10 },
      { path: 'big.exe', bytes: 11 },
    ];
    expect(oversizedInstallers(installers, 10).map(({ path }) => path)).toEqual([
      'exact.exe',
      'big.exe',
    ]);
  });
});
