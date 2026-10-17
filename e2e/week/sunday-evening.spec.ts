import { readFile } from 'node:fs/promises';
import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

const SUNDAY_EVENING = new Date('2026-10-18T21:00:00');
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

test.describe('F3-WK-01..06 Sunday evening on the week (RF-04, RF-08, RF-10)', () => {
  test.beforeEach(async ({ page }) => {
    // The clock is frozen, so chart animations would never finish.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.setFixedTime(SUNDAY_EVENING);
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
    await expect(page.getByText('Day saved. Nice one!')).toBeVisible();
    await page.getByRole('navigation').getByRole('button', { name: 'Week' }).click();
    await expect(page.getByRole('meter', { name: 'Week score' })).toBeVisible();
  });

  test('reads the week, opens the logged Sunday and goes back to edit it', async ({ page }) => {
    await expect(page.getByRole('meter', { name: 'Week score' })).toBeVisible();
    await expect(page.getByText('8 h average')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next week' })).toBeDisabled();
    const days = page.getByRole('list', { name: 'Days of the week' });
    await expect(days.getByText('Not logged')).toHaveCount(6);
    await page.screenshot({ path: 'e2e/week/screenshots/W1-1280.png', fullPage: true });

    await days.getByRole('button', { name: /^Sun/ }).click();
    const detail = page.getByRole('dialog', { name: 'Sunday, October 18' });
    await expect(detail.getByText('Hours slept: 8')).toBeVisible();
    await detail.getByRole('button', { name: 'Edit' }).click();
    await expect(
      page.getByRole('region', { name: 'Sleep' }).getByRole('textbox', { name: 'Hours slept' }),
    ).toHaveValue('8\u00a0hours');
  });

  test('creates the signed weekly report and saves it as a PNG', async ({ page }) => {
    await page.getByRole('button', { name: 'Create report' }).click();
    const dialog = page.getByRole('dialog', { name: 'Weekly report' });
    await expect(
      dialog.getByRole('img', { name: 'Your weekly report with its QR code' }),
    ).toBeVisible();
    const download = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Save image' }).click();
    const saved = await download;
    expect(saved.suggestedFilename()).toBe('vitapact-2026-W42.png');
    const bytes = await readFile(await saved.path());
    expect([...bytes.subarray(0, 4)]).toEqual(PNG_SIGNATURE);
    await expect(dialog.getByText('Report saved. Send the image to your friends.')).toBeVisible();
  });

  test('copies the report image to the clipboard, ready to paste in a chat', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Create report' }).click();
    const dialog = page.getByRole('dialog', { name: 'Weekly report' });
    await dialog.getByRole('button', { name: 'Copy image' }).click();
    await expect(
      dialog.getByText('Image copied. Paste it in your group chat with Ctrl+V.'),
    ).toBeVisible();
    const copied = await page.evaluate(async () => {
      const [item] = await navigator.clipboard.read();
      const png = await item?.getType('image/png');
      return png ? [...new Uint8Array(await png.arrayBuffer()).subarray(0, 4)] : [];
    });
    expect(copied).toEqual(PNG_SIGNATURE);
    await page.screenshot({ path: 'e2e/week/screenshots/W3-copied-1280.png' });
  });

  test('RF-29 fits a phone-width window after the window shrinks', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('navigation')).toHaveAttribute('data-placement', 'bottomBar');
    await page.screenshot({ path: 'e2e/week/screenshots/W1-390.png', fullPage: true });
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
  });
});
