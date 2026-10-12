import { expect, test, type Page } from '../fixtures';
import { startWithProfile } from '../support/localData';

const SCREENSHOTS = 'e2e/noteboard/screenshots';

async function writeNote(page: Page, title: string, body: string, tag: string) {
  await page.getByRole('button', { name: 'New note' }).first().click();
  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('textbox', { name: 'Text' }).fill(body);
  await page.getByRole('textbox', { name: 'Tag' }).fill(tag);
  await page.getByRole('button', { name: 'Save' }).click();
}

test.describe('RF-17 Noteboard notes kept on this device', () => {
  test('writes, edits and deletes a note that survives a reload', async ({ page }) => {
    await startWithProfile(page, '#/noteboard');
    await expect(page.getByRole('heading', { name: 'No notes yet' })).toBeVisible();

    await writeNote(page, 'Session', 'We talked about sleep.', 'Psychologist');
    await page.reload();
    await page.getByRole('button', { name: /Session/ }).click();
    await expect(page.getByRole('textbox', { name: 'Text' })).toHaveValue('We talked about sleep.');

    await page.getByRole('textbox', { name: 'Text' }).fill('We talked about training.');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.reload();
    await page.getByRole('button', { name: /Session/ }).click();
    await expect(page.getByRole('textbox', { name: 'Text' })).toHaveValue(
      'We talked about training.',
    );

    await page.getByRole('button', { name: 'Delete note' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'No notes yet' })).toBeVisible();
  });
});

test.describe('F3-NB-01 Noteboard screenshots for review', () => {
  for (const width of [1280, 390]) {
    test(`shows the list and the editor at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await startWithProfile(page, '#/noteboard');
      await writeNote(page, 'Session', 'We talked about sleep and stress.', 'Psychologist');
      await writeNote(page, 'Long walk', 'Two hours by the river, no phone.', 'Activity');
      await page.screenshot({ path: `${SCREENSHOTS}/N1-list-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: /Session/ }).click();
      await page.screenshot({ path: `${SCREENSHOTS}/N1-editor-${width}.png`, fullPage: true });
    });
  }
});
