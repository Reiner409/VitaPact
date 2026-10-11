import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const MAX_INSTALLER_BYTES = 15 * 1024 * 1024;

export interface Installer {
  path: string;
  bytes: number;
}

export function findInstallers(directory: string): Installer[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((name) => /\.(exe|msi)$/i.test(name))
    .map((name) => join(directory, name))
    .map((path) => ({ path, bytes: statSync(path).size }));
}

/** RNF-09: every installer must stay under 15 MB. */
export function oversizedInstallers(
  installers: Installer[],
  limit = MAX_INSTALLER_BYTES,
): Installer[] {
  return installers.filter(({ bytes }) => bytes >= limit);
}
