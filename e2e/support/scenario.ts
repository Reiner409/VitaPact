import { readFile } from 'node:fs/promises';
import { readQrCode, readReport } from '@vitapact/core/report';
import { expect, type Page } from '../fixtures';

/** A day's answers as the user taps them on Today. */
export interface DayAnswers {
  hoursSlept: string;
  sleepQuality: string;
  food: string;
  sunMinutes: string;
}

export const GOOD_DAY: DayAnswers = {
  hoursSlept: '8',
  sleepQuality: 'Good',
  food: 'Spotless',
  sunMinutes: '30',
};

export const POOR_DAY: DayAnswers = {
  hoursSlept: '5',
  sleepQuality: 'Poor',
  food: 'Disaster',
  sunMinutes: '0',
};

/** Logs today on the Today screen and saves it (section 3, scenario 3). */
export async function logDay(page: Page, answers: DayAnswers) {
  const sleep = page.getByRole('region', { name: 'Sleep' });
  await sleep.getByRole('textbox', { name: 'Hours slept' }).fill(answers.hoursSlept);
  await sleep.getByRole('radio', { name: answers.sleepQuality, exact: true }).click();
  await page.getByRole('region', { name: 'Training' }).getByRole('button', { name: 'No' }).click();
  await page
    .getByRole('region', { name: 'Clean eating' })
    .getByRole('radio', { name: answers.food, exact: true })
    .click();
  await page
    .getByRole('region', { name: 'Sun' })
    .getByRole('textbox', { name: 'Minutes in the sun' })
    .fill(answers.sunMinutes);
  await page.getByRole('button', { name: 'Save day' }).click();
  await expect(page.getByText('Day saved. Nice one!')).toBeVisible();
}

/** Creates the weekly report on the Week screen and returns the saved PNG (scenario 5). */
export async function saveWeeklyReport(page: Page): Promise<Buffer> {
  await page.getByRole('navigation').getByRole('button', { name: 'Week' }).click();
  await page.getByRole('button', { name: 'Create report' }).click();
  const dialog = page.getByRole('dialog', { name: 'Weekly report' });
  const download = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Save image' }).click();
  const png = await readFile(await (await download).path());
  await dialog.getByRole('button', { name: 'Close' }).click();
  return png;
}

/** Pastes a PNG on the page, as after copying it from a chat app (scenario 6). */
export async function pastePng(page: Page, png: Buffer) {
  await page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const clipboard = new DataTransfer();
    clipboard.items.add(new File([bytes], 'report.png', { type: 'image/png' }));
    document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: clipboard }));
  }, png.toString('base64'));
}

/** Adds the pasted report to the named group and waits for the confirmation. */
export async function addPastedReport(page: Page, nickname: string, group: string) {
  const dialog = page.getByRole('dialog', { name: 'Add report' });
  await dialog.getByText(group, { exact: true }).click();
  await dialog.getByRole('button', { name: 'Add report' }).click();
  await expect(page.getByText(`${nickname}'s report was added.`)).toBeVisible();
  await expect(dialog).toBeHidden();
}

export async function createGroup(page: Page, name: string, stake: string) {
  await page.getByRole('button', { name: 'New group' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'New group' });
  await dialog.getByLabel('Group name').fill(name);
  await dialog.getByLabel('Stake', { exact: true }).fill(stake);
  await dialog.getByRole('button', { name: 'Create group' }).click();
  await expect(page.getByText(`At stake: ${stake}`)).toBeVisible();
}

/** Decodes a saved report PNG in the browser and reads its signed content in Node. */
export async function readSavedReport(page: Page, png: Buffer) {
  const image = await page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No 2D context');
    context.drawImage(bitmap, 0, 0);
    const { data, width, height } = context.getImageData(0, 0, bitmap.width, bitmap.height);
    let binary = '';
    for (let start = 0; start < data.length; start += 0x8000) {
      binary += String.fromCharCode(...data.subarray(start, start + 0x8000));
    }
    return { width, height, base64: btoa(binary) };
  }, png.toString('base64'));
  const qr = readQrCode({
    width: image.width,
    height: image.height,
    data: new Uint8ClampedArray(Buffer.from(image.base64, 'base64')),
  });
  if (!qr.ok) throw new Error(`The report QR code does not read: ${qr.error}`);
  return { raw: Buffer.from(qr.content), report: await readReport(qr.content) };
}
