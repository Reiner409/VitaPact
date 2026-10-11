import { readFileSync } from 'node:fs';
import { isTestFile, listRepoFiles, REPO_ROOT } from '../lib/files.ts';
import { uncoveredRequirements, type MatrixEntry } from './matrix.ts';

const MATRIX_PATH = 'docs/traceability-matrix.json';
const TEST_FOLDERS = ['app', 'screens', 'shared', 'core', 'platform', 'tools', 'e2e', 'src-tauri'];

const matrix = JSON.parse(readFileSync(`${REPO_ROOT}${MATRIX_PATH}`, 'utf8')) as {
  requirements: MatrixEntry[];
};
const testSources = listRepoFiles(TEST_FOLDERS, isTestFile).map((path) =>
  readFileSync(`${REPO_ROOT}${path}`, 'utf8'),
);
const missing = uncoveredRequirements(matrix.requirements, testSources);

if (missing.length > 0) {
  console.error(`No test title mentions: ${missing.join(', ')} (see ${MATRIX_PATH}).`);
  process.exit(1);
}
console.log(`${matrix.requirements.length} requirements in the matrix, each covered by a test.`);
