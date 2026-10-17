import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '../fixtures';
import { sampleProfile } from '@vitapact/core/storage/testing';
import { startWithProfile } from '../support/localData';

const SCREENSHOTS = 'e2e/settings/screenshots';

async function openSettings(page: Page) {
  await startWithProfile(page, '#/settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
}

test.describe('RF-19 export and import from settings', () => {
  test('restores the exported data after it changed', async ({ page }) => {
    await openSettings(page);
    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export data' }).click();
    const backupPath = await (await downloading).path();
    const backup = await readFile(backupPath);

    await page.getByRole('textbox', { name: 'Nickname' }).fill('Changed');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await expect(page.getByText('Profile saved.')).toBeVisible();

    const choosing = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import data' }).click();
    await (
      await choosing
    ).setFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backup });
    await page.getByRole('button', { name: 'Replace my data' }).click();
    await expect(page.getByText('Data imported.')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Nickname' })).toHaveValue(
      sampleProfile.nickname,
    );
  });
});

test.describe('S2 S3 settings screenshots', () => {
  for (const width of [1280, 390]) {
    test(`at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openSettings(page);
      await page.screenshot({ path: `${SCREENSHOTS}/S2-S3-${width}.png`, fullPage: true });
    });
  }
});
