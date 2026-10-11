import { expect, test } from './fixtures';

test.describe('F1-01 smoke: navigation between the empty screens', () => {
  test('opens on Today', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  });

  for (const name of ['Week', 'Friends', 'Noteboard', 'Settings', 'Today']) {
    test(`opens ${name} from the navigation`, async ({ page }) => {
      await page.goto('/');
      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('button', { name })
        .click();
      await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    });
  }

  test('opens the onboarding screen from its address', async ({ page }) => {
    await page.goto('/#/onboarding');
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
  });
});
