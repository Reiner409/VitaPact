import { expect, test } from './fixtures';
import { startWithProfile } from './support/localData';

test.describe('F1-01 smoke: navigation between the screens', () => {
  test('opens on Today', async ({ page }) => {
    await startWithProfile(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  });

  for (const name of ['Week', 'Friends', 'Noteboard', 'Settings', 'Today']) {
    test(`opens ${name} from the navigation`, async ({ page }) => {
      await startWithProfile(page);
      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('button', { name })
        .click();
      await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    });
  }
});

test.describe('RF-01 first launch', () => {
  test('opens on the welcome screen, without the navigation, on a new device', async ({ page }) => {
    await page.goto('/#/today');
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
    await expect(page.getByRole('navigation')).toHaveCount(0);
  });

  test('keeps the profile after a reload and never shows the welcome screen again', async ({
    page,
  }) => {
    await startWithProfile(page, '#/onboarding');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  });
});
