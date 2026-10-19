import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

/** RNF-06: ready in under 2 s. The web build in Chromium stands in for the Windows window. */
const STARTUP_LIMIT_MS = 2000;

test.describe('F4-01 startup time', () => {
  test('RNF-06 shows Today, ready to log, in under 2 seconds', async ({ page }) => {
    await startWithProfile(page);
    await page.reload();
    await page.getByRole('button', { name: 'Save day' }).waitFor();
    // Measured by the page itself from the start of the navigation, not by the test's polling.
    const readyAfterMs = await page.evaluate(() => performance.now());
    expect(readyAfterMs).toBeLessThan(STARTUP_LIMIT_MS);
  });
});
