import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

const MONDAY_EVENING = new Date('2026-10-12T21:00:00');

test.describe('F3-TD-06 live day score (RF-03, RF-09)', () => {
  test('rises with each answer, keeps the saved day editable and stores only on save', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.setFixedTime(MONDAY_EVENING);
    await startWithProfile(page);
    const score = page.getByRole('meter', { name: 'Day score' });
    const sleep = page.getByRole('region', { name: 'Sleep' });
    const food = page.getByRole('region', { name: 'Clean eating' });
    const sun = page.getByRole('region', { name: 'Sun' });

    // Nothing done: no sleep, so no quality to rate, the worst food and no sun.
    await sleep.getByRole('textbox', { name: 'Hours slept' }).fill('0');
    await expect(sleep.getByRole('radio')).toHaveCount(0);
    await page
      .getByRole('region', { name: 'Training' })
      .getByRole('button', { name: 'No' })
      .click();
    await food.getByRole('radio', { name: 'Disaster' }).click();
    await sun.getByRole('textbox', { name: 'Minutes in the sun' }).fill('0');
    await expect(score).toHaveAttribute('aria-valuenow', '0');

    await food.getByRole('radio', { name: 'Spotless' }).click();
    await expect(score).toHaveAttribute('aria-valuenow', '36');
    await page.getByRole('button', { name: 'Save day' }).click();
    await expect(page.getByText('Day saved.')).toBeVisible();

    await page.getByRole('navigation').getByRole('button', { name: 'Week' }).click();
    await page.getByRole('navigation').getByRole('button', { name: 'Today' }).click();
    await expect(score).toHaveAttribute('aria-valuenow', '36');
    await sun.getByRole('button', { name: '30 min' }).click();
    await expect(score).toHaveAttribute('aria-valuenow', '55');
    await expect(page.getByText('Your changes are not saved yet.')).toBeVisible();
    await page.screenshot({ path: 'e2e/today/screenshots/T3-1280.png', fullPage: true });

    // Without "Save day" the change is not stored.
    await page.reload();
    await expect(score).toHaveAttribute('aria-valuenow', '36');
  });
});
