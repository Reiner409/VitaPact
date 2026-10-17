import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

const MONDAY_EVENING = new Date('2026-10-12T21:00:00');

test.describe('F3-TD-06 F3-TD-07 evening check-in (RF-03)', () => {
  test('logs the day, saves it, sees the score and finds it again after a reload', async ({
    page,
  }) => {
    await page.clock.setFixedTime(MONDAY_EVENING);
    await startWithProfile(page);

    const sleep = page.getByRole('region', { name: 'Sleep' });
    await sleep.getByRole('textbox', { name: 'Hours slept' }).fill('8');
    await sleep.getByRole('radio', { name: 'Good' }).click();
    await page
      .getByRole('region', { name: 'Training' })
      .getByRole('button', { name: 'No' })
      .click();
    await page
      .getByRole('region', { name: 'Clean eating' })
      .getByRole('radio', { name: 'Spotless' })
      .click();
    await page.getByRole('region', { name: 'Sun' }).getByRole('button', { name: '30 min' }).click();
    await page.getByRole('button', { name: 'Save day' }).click();

    await expect(page.getByText('Day saved.')).toBeVisible();
    await expect(page.getByRole('meter', { name: 'Day score' })).toBeVisible();
    const strip = page.getByRole('list', { name: 'This week' });
    await expect(strip.getByText('Not logged')).toHaveCount(6);
    await page.screenshot({ path: 'e2e/today/screenshots/T2-1280.png', fullPage: true });

    await page.reload();
    await expect(
      page
        .getByRole('region', { name: 'Sun' })
        .getByRole('textbox', { name: 'Minutes in the sun' }),
    ).toHaveValue('30');
  });
});
