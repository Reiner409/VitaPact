import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { listRepoFiles, REPO_ROOT } from '../lib/files';
import { findRawStyleValues } from './rawStyleValues';

describe('F1-02 raw style value detector', () => {
  it.each([
    ['<Box c="#3E7A4E" />', '#3E7A4E'],
    ["style={{ color: '#fff' }}", '#fff'],
    ['style={{ padding: "16px" }}', '16px'],
    ['gap: 1.5px', '1.5px'],
    ["background: 'rgba(0, 0, 0, 0.1)'", 'rgba('],
  ])('flags %s', (source, expected) => {
    expect(findRawStyleValues(source)).toEqual([expected]);
  });

  it('accepts token names', () => {
    expect(findRawStyleValues('<Card p="md" c="var(--vp-color-text)" />')).toEqual([]);
  });
});

describe('F1-02 screens contain no hand-written colours or pixel sizes', () => {
  const screenFiles = listRepoFiles(['screens'], (path) => /\.(tsx?|css)$/.test(path));

  it('scans at least one file per screen', () => {
    expect(screenFiles.length).toBeGreaterThanOrEqual(6);
  });

  it.each(screenFiles)('%s', (path) => {
    expect(findRawStyleValues(readFileSync(`${REPO_ROOT}${path}`, 'utf8'))).toEqual([]);
  });
});
