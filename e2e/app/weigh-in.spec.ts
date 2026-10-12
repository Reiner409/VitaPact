import { expect, test, type Page } from '../fixtures';
import { startWithProfile } from '../support/localData';

/** 18 October 2026 is a Sunday; the clock is fixed before the app starts. */
async function startOn(page: Page, moment: string) {
  await page.clock.setFixedTime(new Date(moment));
  await startWithProfile(page, '', { weighInDone: false });
}

const reminder = (page: Page) => page.getByRole('button', { name: 'Weigh in' });

test.describe('F3-TD-09 weigh-in reminder (RF-05, RF-06, RF-07)', () => {
  test('Sunday morning: "Later", then the reminder on every screen, then the weigh-in', async ({
    page,
  }) => {
    await startOn(page, '2026-10-18T08:00:00');
    const dialog = page.getByRole('dialog', { name: 'Sunday weigh-in' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Later' }).click();
    await expect(dialog).toBeHidden();

    await expect(reminder(page)).toBeVisible();
    await page.screenshot({ path: 'e2e/app/screenshots/A2-1280.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'e2e/app/screenshots/A2-390.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 800 });

    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Friends' })
      .click();
    await expect(page.getByRole('heading', { level: 1, name: 'Friends' })).toBeVisible();
    await reminder(page).click();
    await dialog.getByRole('textbox', { name: /Weight/ }).fill('71.5');
    await dialog.getByRole('checkbox', { name: /empty stomach/ }).check();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(reminder(page)).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Friends' })).toBeVisible();
    await expect(reminder(page)).toHaveCount(0);
    await expect(dialog).toHaveCount(0);
  });

  test('Wednesday: the missed weigh-in is no longer asked for', async ({ page }) => {
    await startOn(page, '2026-10-21T08:00:00');
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
    await expect(reminder(page)).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
