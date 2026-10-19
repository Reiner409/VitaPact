import { expect, test } from '../fixtures';
import {
  GOOD_DAY,
  addPastedReport,
  createGroup,
  logDay,
  openScreen,
  pasteReportImage,
  signedReportImage,
  startOnSundayEvening,
} from '../support/scenario';

/**
 * Giulia's week after a hard one: 20 points, up from 5, so her report is a comeback. Her 20 is
 * below Rei's day, so without the comeback rule she would be the one who pays.
 */
const giuliaComeback = {
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b91',
  nickname: 'Giulia',
  hideWeight: false,
  generatedOn: '2026-10-18',
  week: '2026-W42',
  logged: 2,
  sleepAvg: 6,
  sleepOk: 1,
  trainDone: 0,
  trainGoal: 3,
  trainMin: 0,
  cleanOk: 1,
  sunOk: 0,
  score: 20,
  prevScore: 5,
};

test.describe('F4-01 the comeback (section 3, scenario 7, RF-27)', () => {
  test('RF-27 marks the friend back from a hard week and keeps them from paying', async ({
    page,
  }) => {
    await startOnSundayEvening(page);
    await logDay(page, GOOD_DAY);
    await openScreen(page, 'Friends');
    await createGroup(page, 'Pact', 'the pizza');
    await pasteReportImage(page, await signedReportImage(giuliaComeback));
    await addPastedReport(page, 'Giulia', 'Pact');

    const ranking = page.getByRole('list', { name: 'Week 42 ranking' });
    await expect(ranking.getByRole('listitem').first()).toContainText('Rei');
    await expect(ranking.getByRole('listitem').last()).toContainText('Giulia');
    const weekend = page.getByRole('region', { name: 'This weekend' });
    await expect(weekend).toContainText('Rei');
    await expect(weekend).not.toContainText('Giulia');
    await expect(ranking).toContainText('Comeback +15 points');
  });
});
