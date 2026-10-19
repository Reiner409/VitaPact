import { createSigningKeys } from '@vitapact/core/crypto';
import { createReport } from '@vitapact/core/report';
import { renderReportPixels, sampleReportCard } from '@vitapact/core/report/testing';
import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';
import { GOOD_DAY, addPastedReport, createGroup, logDay } from '../support/scenario';

const SUNDAY_EVENING = new Date('2026-10-18T21:00:00');

/** Giulia's week after a hard one: 20 points, up from 5, so her report is a comeback (RF-27). */
async function giuliaComebackPixels() {
  const content = await createReport(
    {
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
    },
    await createSigningKeys(),
  );
  const drawn = renderReportPixels({ ...sampleReportCard, content, nickname: 'Giulia' });
  return {
    width: drawn.width,
    height: drawn.height,
    base64: Buffer.from(drawn.data).toString('base64'),
  };
}

test.describe('F4-01 the comeback (section 3, scenario 7, RF-27)', () => {
  test('marks the friend back from a hard week and keeps them from paying', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.setFixedTime(SUNDAY_EVENING);
    await startWithProfile(page);
    await logDay(page, GOOD_DAY);
    await page.getByRole('navigation').getByRole('button', { name: 'Friends' }).click();
    await createGroup(page, 'Pact', 'the pizza');

    await page.evaluate(
      async ({ width, height, base64 }) => {
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
        const canvas = new OffscreenCanvas(width, height);
        canvas
          .getContext('2d')
          ?.putImageData(new ImageData(new Uint8ClampedArray(bytes), width), 0, 0);
        const png = await canvas.convertToBlob({ type: 'image/png' });
        const clipboard = new DataTransfer();
        clipboard.items.add(new File([png], 'image.png', { type: 'image/png' }));
        document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: clipboard }));
      },
      await giuliaComebackPixels(),
    );
    await addPastedReport(page, 'Giulia', 'Pact');

    const ranking = page.getByRole('list', { name: 'Week 42 ranking' });
    await expect(ranking).toContainText('Comeback +15 points');
    const weekend = page.getByRole('region', { name: 'This weekend' });
    await expect(weekend).toContainText('Rei');
    await expect(weekend).not.toContainText('Giulia');
  });
});
