import { readFileSync } from 'node:fs';
import { resourcesFromModules } from '../../shared/i18n/src/resources.ts';
import { isSourceFile, listRepoFiles, REPO_ROOT } from '../lib/files.ts';
import { extractKeyUsages, findMissingKeys } from './keyUsage.ts';

const CODE_FOLDERS = ['app', 'screens', 'shared'];
const read = (path: string) => readFileSync(`${REPO_ROOT}${path}`, 'utf8');

export function checkTranslationKeys() {
  const localeFiles = listRepoFiles(CODE_FOLDERS, (path) =>
    /\/locales\/[^/]+\/[^/]+\.json$/.test(path),
  );
  const resources = resourcesFromModules(
    Object.fromEntries(localeFiles.map((path) => [`/${path}`, JSON.parse(read(path))])),
  );
  const usages = listRepoFiles(CODE_FOLDERS, isSourceFile).flatMap((path) =>
    extractKeyUsages(read(path), path),
  );
  return findMissingKeys(usages, resources.en ?? {});
}

if (import.meta.main) {
  const missing = checkTranslationKeys();
  for (const { file, namespace, key } of missing) {
    console.error(
      `${file}: "${key}" is missing from locales/en/${namespace ?? '<unknown namespace>'}.json`,
    );
  }
  if (missing.length > 0) process.exit(1);
  console.log('All translation keys used in the code exist in English.');
}
