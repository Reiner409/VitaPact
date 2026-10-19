import { expect, test } from '../fixtures';
import {
  GOOD_DAY,
  logDay,
  openScreen,
  readSavedReport,
  saveWeeklyReport,
  startOnSundayEvening,
  writeNote,
} from '../support/scenario';

test.describe('F4-01 the session with the psychologist (section 3, scenario 8)', () => {
  test('RNF-02 keeps the notes out of the weekly report and its QR code', async ({ page }) => {
    await startOnSundayEvening(page);
    await logDay(page, GOOD_DAY);
    await openScreen(page, 'Noteboard');
    await writeNote(page, 'Session', 'Talked about my brother', 'Psychologist');
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
