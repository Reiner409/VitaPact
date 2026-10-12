import { expect, test } from '../fixtures';

const SCREENSHOTS = 'e2e/onboarding/screenshots';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'phone', width: 390, height: 844 },
] as const;

test.describe('RF-01 welcome step 1: nickname', () => {
  for (const viewport of VIEWPORTS) {
    test(`asks for a nickname before continuing (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/#/onboarding');
      const nickname = page.getByRole('textbox', { name: 'Your nickname' });
      const continueButton = page.getByRole('button', { name: 'Continue' });

      await continueButton.click();
      await expect(page.getByRole('alert')).toHaveText('Enter a nickname to continue.');

      await nickname.fill('Élodie 🌞');
      await expect(page.getByText(/^8 of 24 characters/)).toBeVisible();
      await page.screenshot({ path: `${SCREENSHOTS}/B1-${viewport.width}.png` });

      await continueButton.click();
      await expect(page.getByText('Step 2 of 3')).toBeVisible();
      await page.getByRole('button', { name: 'Back' }).click();
      await expect(nickname).toHaveValue('Élodie 🌞');
    });
  }
});
