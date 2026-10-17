import { expect, test, type Page } from '../fixtures';
import { startWithProfile } from '../support/localData';

const SCREENSHOTS = 'e2e/noteboard/screenshots';
const PASSWORD = 'blue whale';

/** Every note as IndexedDB holds it, read straight from the store. */
const storedNotes = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<string>((resolve, reject) => {
        const request = indexedDB.open('vitapact');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const all = request.result.transaction('notes').objectStore('notes').getAll();
          all.onsuccess = () => resolve(JSON.stringify(all.result));
          all.onerror = () => reject(all.error);
        };
      }),
  );

test.describe('F3-NB-04..06 RF-18 the Noteboard password', () => {
  test('locks the notes on disk, asks for the password after a reload and removes it', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await startWithProfile(page, '#/noteboard');
    await page.getByRole('button', { name: 'New note' }).first().click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Session');
    await page.getByRole('textbox', { name: 'Text' }).fill('We talked about sleep.');
    await page.getByRole('button', { name: 'Save' }).click();

    await page.getByRole('button', { name: 'Set password' }).click();
    const set = page.getByRole('dialog', { name: 'Set a Noteboard password' });
    await set.getByLabel('New password').fill(PASSWORD);
    await set.getByLabel('Repeat the password').fill(PASSWORD);
    await expect(set.getByRole('button', { name: 'Lock my notes' })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOTS}/N3-set-password-1280.png` });
    await set.getByRole('button', { name: 'Lock my notes' }).click();
    await expect(page.getByRole('button', { name: 'Lock now' })).toBeVisible();
    expect(await storedNotes(page)).not.toContain('We talked about sleep.');

    await page.reload();
    await expect(page.getByText('Your notes are locked.', { exact: false })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOTS}/N4-locked-1280.png` });
    await page.getByLabel('Noteboard password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Unlock' }).click();
    await page.getByRole('button', { name: /Session/ }).click();
    await expect(page.getByRole('textbox', { name: 'Text' })).toHaveValue('We talked about sleep.');
    await page.getByRole('button', { name: 'Back to notes' }).click();

    await page.getByRole('button', { name: 'Remove password' }).click();
    const remove = page.getByRole('dialog', { name: 'Remove the Noteboard password' });
    await remove.getByLabel('Current password').fill(PASSWORD);
    await remove.getByRole('button', { name: 'Remove password' }).click();
    await expect(page.getByRole('button', { name: 'Set password' })).toBeVisible();
    expect(await storedNotes(page)).toContain('We talked about sleep.');
  });
});
