import { expect, test, type Page } from '../fixtures';
import { sampleProfile } from '@vitapact/core/storage/testing';
import { startWithProfile } from '../support/localData';

const SCREENSHOTS = 'e2e/settings/screenshots';

async function openSettings(page: Page) {
  await startWithProfile(page, '#/settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
}

test.describe('RF-01 edit the profile in settings', () => {
  test('keeps the new nickname and goals after a reload', async ({ page }) => {
    await openSettings(page);
    await page.getByRole('textbox', { name: 'Nickname' }).fill('Sam');
    await page.getByRole('textbox', { name: 'Workouts per week' }).fill('4');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(page.getByRole('status')).toHaveText('Profile saved.');

    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveValue('Sam');
    await expect(page.getByRole('textbox', { name: 'Workouts per week' })).toHaveValue('4');
  });
});

test.describe('RF-02 the user id in settings', () => {
  test('shows the UUID as text, not as a field', async ({ page }) => {
    await openSettings(page);
    await expect(page.getByText(sampleProfile.userId)).toBeVisible();
    for (const field of await page.getByRole('textbox').all()) {
      await expect(field).not.toHaveValue(sampleProfile.userId);
    }
  });
});

test.describe('S1 profile screenshots', () => {
  for (const width of [1280, 390]) {
    test(`at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openSettings(page);
      await page.screenshot({ path: `${SCREENSHOTS}/S1-${width}.png`, fullPage: true });
    });
  }
});
