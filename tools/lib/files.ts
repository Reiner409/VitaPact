import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'target', 'gen', 'coverage', '.git']);

/** Lists files under the given repo folders, as repo-relative paths with forward slashes. */
export function listRepoFiles(folders: string[], accept: (path: string) => boolean): string[] {
  const found: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) walk(path);
      } else {
        const repoPath = relative(REPO_ROOT, path).split('\\').join('/');
        if (accept(repoPath)) found.push(repoPath);
      }
    }
  };
  for (const folder of folders) walk(join(REPO_ROOT, folder));
  return found.sort();
}

export const isTestFile = (path: string) => /\.(test|spec)\.tsx?$/.test(path);
export const isSourceFile = (path: string) => /\.tsx?$/.test(path) && !isTestFile(path);
