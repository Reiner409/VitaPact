import type { DailyEntry, WeighIn } from '@vitapact/core/storage';
import { expect, test, type Page } from '../fixtures';
import { startWithProfile } from '../support/localData';

const SUNDAY_EVENING = new Date('2026-10-11T19:00:00');

type DayLog = [date: string, sleep: number, trained: boolean, rating: number, sun: number];

const day = ([date, sleep, trained, rating, sun]: DayLog) => ({
  date,
  pillars: {
    sleep: { hours: sleep, quality: 4 },
    training: trained
      ? { trained: true, type: 'gym', minutes: 50 }
      : { trained: false, type: null, minutes: null },
    food: { rating },
    sun: { minutes: sun },
  },
  updatedAt: `${date}T21:00:00.000Z`,
});

const WEEK_41: DailyEntry[] = [
  day(['2026-10-05', 8, true, 5, 30]),
  day(['2026-10-06', 7, false, 4, 15]),
  day(['2026-10-07', 7.5, true, 3, 25]),
  day(['2026-10-08', 6.5, false, 4, 40]),
  day(['2026-10-09', 8, true, 5, 10]),
  day(['2026-10-10', 7, false, 2, 20]),
];

const WEIGH_IN: WeighIn = {
  week: '2026-W41',
  weightKg: 78.4,
  measuredOn: '2026-10-11',
  fastingConfirmed: true,
};

async function saveWeek(page: Page) {
  await page.evaluate(
    ({ entries, weighIn }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('vitapact');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const transaction = request.result.transaction(['dailyEntries', 'weighIns'], 'readwrite');
          for (const entry of entries) transaction.objectStore('dailyEntries').put(entry);
          transaction.objectStore('weighIns').put(weighIn);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      }),
    { entries: WEEK_41, weighIn: WEIGH_IN },
  );
}

async function openWeek(page: Page) {
  await page.clock.setFixedTime(SUNDAY_EVENING);
  await startWithProfile(page);
  await saveWeek(page);
  await page.goto('/#/week');
  await page.reload();
}

test.describe('RF-08 RF-09 week score, verdict and pillars (W1)', () => {
  test('shows the saved week with its score, verdict and pillars', async ({ page }) => {
    await openWeek(page);
    await expect(page.getByText('Week 41 · Oct 5 – Oct 11, 2026')).toBeVisible();
    await expect(page.getByRole('meter', { name: 'Week score' })).toHaveAttribute(
      'aria-valuenow',
      '71',
    );
    await expect(page.getByText('On track')).toBeVisible();
    await expect(page.getByText('7.3 h average')).toBeVisible();
    await expect(page.getByText('3 of 3 workouts')).toBeVisible();
    await page.screenshot({ path: 'e2e/week/screenshots/W1-1280.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'e2e/week/screenshots/W1-390.png', fullPage: true });
  });

  test('goes back to an empty week and forward again', async ({ page }) => {
    await openWeek(page);
    const next = page.getByRole('button', { name: 'Next week' });
    await expect(next).toBeDisabled();
    await page.getByRole('button', { name: 'Previous week' }).click();
    await expect(page.getByText('Week 40 · Sep 28 – Oct 4, 2026')).toBeVisible();
    await expect(page.getByRole('meter', { name: 'Week score' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    await next.click();
    await expect(page.getByText('Week 41 · Oct 5 – Oct 11, 2026')).toBeVisible();
  });
});
