import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

const MONDAY_MORNING = new Date('2026-10-12T09:00:00');
const SCREENSHOT_WIDTHS = [1280, 390];

test.describe('F3-TD-01 F3-TD-05 the Today screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(MONDAY_MORNING);
    await startWithProfile(page);
  });

  test('shows the day and fills the four pillar cards', async ({ page }) => {
    await expect(page.getByText('Monday, October 12 · Week 42 · 6 days to Sunday')).toBeVisible();
    const sleep = page.getByRole('region', { name: 'Sleep' });
    await sleep.getByRole('textbox', { name: 'Hours slept' }).fill('7.5');
    await sleep.getByRole('radio', { name: 'Good' }).click();
    const training = page.getByRole('region', { name: 'Training' });
    await training.getByRole('button', { name: 'Yes' }).click();
    await training.getByText('Running').click();
    await training.getByRole('textbox', { name: 'Duration' }).fill('40');
    const eating = page.getByRole('region', { name: 'Clean eating' });
    await eating.getByRole('radio', { name: 'Decent' }).click();
    await page.getByRole('region', { name: 'Sun' }).getByRole('textbox').fill('25');
    await expect(sleep.getByText('Goal reached')).toBeVisible();
    await expect(training.getByRole('radio', { name: 'Running' })).toBeChecked();

    for (const width of SCREENSHOT_WIDTHS) {
      // The viewport is as tall as the page, so the fixed phone navigation sits at the real bottom.
      await page.setViewportSize({ width, height: 900 });
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width, height });
      await page.screenshot({ path: `e2e/today/screenshots/T1-${width}.png` });
    }
  });
});
