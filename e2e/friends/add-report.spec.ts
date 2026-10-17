import { createSigningKeys } from '@vitapact/core/crypto';
import { createReport, type WeekReportInput } from '@vitapact/core/report';
import { renderReportPixels, sampleReportCard } from '@vitapact/core/report/testing';
import { expect, test, type Page } from '../fixtures';
import { startWithProfile } from '../support/localData';

const SCREENSHOTS = 'e2e/friends/screenshots';
const MONDAY_MORNING = new Date('2026-10-12T10:00:00');

const giulia: WeekReportInput = {
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b91',
  nickname: 'Giulia',
  hideWeight: false,
  generatedOn: '2026-10-11',
  week: '2026-W41',
  logged: 6,
  sleepAvg: 7.5,
  sleepOk: 5,
  trainDone: 3,
  trainGoal: 3,
  trainMin: 150,
  cleanOk: 4,
  sunOk: 3,
  score: 74,
};

/** Giulia's signed report as the RGBA pixels of the image her app would save. */
async function giuliaImage() {
  const content = await createReport(giulia, await createSigningKeys());
  const drawn = renderReportPixels({ ...sampleReportCard, content, nickname: 'Giulia' });
  return {
    width: drawn.width,
    height: drawn.height,
    base64: Buffer.from(drawn.data).toString('base64'),
  };
}

/** Copies the image as a PNG, the way a chat app does, and pastes it on the screen. */
async function pasteImage(page: Page, image: Awaited<ReturnType<typeof giuliaImage>>) {
  await page.evaluate(async ({ width, height, base64 }) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(bytes), width), 0, 0);
    const png = await canvas.convertToBlob({ type: 'image/png' });
    const clipboard = new DataTransfer();
    clipboard.items.add(new File([png], 'image.png', { type: 'image/png' }));
    document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: clipboard }));
  }, image);
}

async function createGroup(page: Page, name: string, stake: string) {
  await page.getByRole('button', { name: 'New group' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'New group' });
  await dialog.getByLabel('Group name').fill(name);
  await dialog.getByLabel('Stake').fill(stake);
  await dialog.getByRole('button', { name: 'Create group' }).click();
  await expect(page.getByText(`At stake: ${stake}`)).toBeVisible();
}

test.describe('F3-FR-03 F3-FR-04 RF-12 add a friend report from the clipboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(MONDAY_MORNING);
    await startWithProfile(page, '#/friends');
    await expect(page.getByRole('heading', { level: 1, name: 'Friends' })).toBeVisible();
  });

  test('pastes the image, picks two groups and finds the friend in both rankings', async ({
    page,
  }) => {
    await createGroup(page, 'Office', 'brings the coffee');
    await createGroup(page, 'Running club', 'pays for breakfast');

    await pasteImage(page, await giuliaImage());
    const dialog = page.getByRole('dialog', { name: 'Add report' });
    await expect(dialog.getByText('Giulia · week 41')).toBeVisible();
    await dialog.getByText('Office', { exact: true }).click();
    await dialog.getByText('Running club', { exact: true }).click();
    await expect(dialog.getByRole('checkbox', { name: 'Office' })).toBeChecked();
    await expect(dialog.getByRole('checkbox', { name: 'Running club' })).toBeChecked();
    await page.screenshot({ path: `${SCREENSHOTS}/F3-add-report-1280.png` });
    await dialog.getByRole('button', { name: 'Add report' }).click();

    await expect(page.getByText("Giulia's report was added.")).toBeVisible();
    await expect(dialog).toBeHidden();
    const weekRanking = page.getByRole('list', { name: 'Week 41 ranking' });
    await expect(weekRanking).toContainText('Giulia');
    await expect(weekRanking).toContainText('74');
    await page.screenshot({ path: `${SCREENSHOTS}/F3-ranking-1280.png`, fullPage: true });

    await page.getByRole('combobox', { name: 'Group' }).click();
    await page.getByRole('option', { name: 'Office' }).click();
    await expect(page.getByRole('list', { name: 'Week 41 ranking' })).toContainText('Giulia');

    await page.reload();
    await expect(page.getByRole('list', { name: 'Week 41 ranking' })).toContainText('Giulia');
  });

  test('fits a phone-width window', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await createGroup(page, 'Office', 'brings the coffee');
    await pasteImage(page, await giuliaImage());
    const dialog = page.getByRole('dialog', { name: 'Add report' });
    await dialog.getByText('Office', { exact: true }).click();
    await dialog.getByRole('button', { name: 'Add report' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('list', { name: 'Week 41 ranking' })).toContainText('Giulia');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    await page.screenshot({ path: `${SCREENSHOTS}/F3-ranking-390.png`, fullPage: true });
  });
});
