import { expect, test } from '../fixtures';

const SCREENSHOTS = 'e2e/onboarding/screenshots';

test.describe('RF-01 RF-02 first launch, from the welcome to Today', () => {
  test('a new user picks a nickname and goals, accepts the pact and never sees the welcome again', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Your nickname' }).fill('Rei');
    await page.getByRole('button', { name: 'Continue' }).click();

    const sleep = page.getByRole('textbox', { name: 'Sleep each night' });
    await expect(sleep).toHaveValue('7.5');
    await sleep.fill('8');
    await page.screenshot({ path: `${SCREENSHOTS}/B2-1280.png` });
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Everything stays on this PC' })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOTS}/B3-1280.png` });
    await page.getByRole('button', { name: 'Accept your VitaPact.' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toHaveCount(0);
  });
});
