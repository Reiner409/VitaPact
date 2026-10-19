import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';
import { GOOD_DAY, logDay, readSavedReport, saveWeeklyReport } from '../support/scenario';

const SUNDAY_EVENING = new Date('2026-10-18T21:00:00');
const PRIVATE_TEXT = 'Talked about my brother';

test.describe('F4-01 the session with the psychologist (section 3, scenario 8, RF-17)', () => {
  test('keeps the notes out of the weekly report and its QR code', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.setFixedTime(SUNDAY_EVENING);
    await startWithProfile(page);
    await logDay(page, GOOD_DAY);
    await page.getByRole('navigation').getByRole('button', { name: 'Noteboard' }).click();
    await page.getByRole('button', { name: 'New note' }).first().click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Session');
    await page.getByRole('textbox', { name: 'Text' }).fill(PRIVATE_TEXT);
    await page.getByRole('textbox', { name: 'Tag' }).fill('Psychologist');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('button', { name: /Session/ })).toBeVisible();

    const { raw, report } = await readSavedReport(page, await saveWeeklyReport(page));
    if (!report.ok) throw new Error(`The saved report does not read: ${report.error}`);
    expect(report.summary.nick).toBe('Rei');
    const everything = `${raw.toString('latin1')} ${JSON.stringify(report.summary)}`;
    for (const word of ['Session', 'brother', 'Psychologist']) {
      expect(everything).not.toContain(word);
    }
  });
});
