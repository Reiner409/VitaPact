import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

/** F4-01 acceptance: the app is ready in under 2 s; the CI runner is slower than a home PC. */
const STARTUP_LIMIT_MS = 2000;

test.describe('F4-01 startup time (RNF-06)', () => {
  test('shows Today, ready to log, in under 2 seconds', async ({ page }) => {
    await startWithProfile(page);
    const started = Date.now();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Save day' })).toBeVisible();
    expect(Date.now() - started).toBeLessThan(STARTUP_LIMIT_MS);
  });
});
