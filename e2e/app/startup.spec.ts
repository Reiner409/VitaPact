import { readFileSync } from 'node:fs';
import { expect, test } from '../fixtures';

const tauriConfig = JSON.parse(
  readFileSync(new URL('../../src-tauri/tauri.conf.json', import.meta.url), 'utf8'),
) as { app: { security: { freezePrototype?: boolean } } };

test.describe('F1-01 the app starts inside the desktop window', () => {
  test('the first screen appears under the same prototype rules as the Tauri window', async ({
    page,
  }) => {
    // The browser does not freeze Object.prototype by itself; Tauri does when the flag is on.
    if (tauriConfig.app.security.freezePrototype) {
      await page.addInitScript(() => Object.freeze(Object.prototype));
    }
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
    expect(errors).toEqual([]);
  });
});
