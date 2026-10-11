import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { REPO_ROOT } from '../lib/files';
import { allowedImports, forbiddenImports } from './fixtures/cases';

const eslint = new ESLint({ cwd: REPO_ROOT });
// The first lint run loads every plugin, which takes several seconds on a busy machine.
const lintTimeout = { timeout: 30_000 };

async function boundaryMessages(file: string, code: string) {
  const [result] = await eslint.lintText(`${code}\n`, { filePath: `${REPO_ROOT}${file}` });
  return result!.messages.filter((message) => message.ruleId === 'vitapact/package-boundaries');
}

describe('F1-06 package boundaries make lint fail on forbidden imports', lintTimeout, () => {
  it.each(forbiddenImports)('$rule: $code in $file', async ({ file, code }) => {
    const messages = await boundaryMessages(file, code);
    expect(messages).toHaveLength(1);
    expect(messages[0]!.severity).toBe(2);
  });

  it.each(allowedImports)('allows $code in $file', async ({ file, code }) => {
    expect(await boundaryMessages(file, code)).toEqual([]);
  });
});

describe('F1-03 RNF-12 lint flags visible text written in JSX', lintTimeout, () => {
  const lint = async (code: string, file = 'screens/today/src/Text.tsx') => {
    const [result] = await eslint.lintText(`${code}\n`, { filePath: `${REPO_ROOT}${file}` });
    return result!.messages.filter((message) => message.ruleId === 'no-restricted-syntax');
  };

  it.each([
    'export const A = () => <p>Save day</p>;',
    "export const A = () => <p>{'Save day'}</p>;",
    'export const A = () => <p>{`Save ${1}`}</p>;',
    'export const A = () => <input placeholder="Search" />;',
    'export const A = () => <button aria-label="Close" />;',
  ])('%s', async (code) => {
    expect(await lint(code)).toHaveLength(1);
  });

  it('accepts translated text', async () => {
    expect(
      await lint("export const A = ({ t }: { t: (key: string) => string }) => <p>{t('save')}</p>;"),
    ).toEqual([]);
  });

  it('does not apply to test files', async () => {
    expect(
      await lint('export const A = () => <p>Save day</p>;', 'screens/today/src/Text.test.tsx'),
    ).toEqual([]);
  });
});
