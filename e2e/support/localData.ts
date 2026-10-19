import type { Page } from '../fixtures';
import { toCalendarDate, weighInWeekFor } from '@vitapact/core/calendar';
import { sampleProfile } from '@vitapact/core/storage/testing';
import type { Profile } from '@vitapact/core/storage';

export interface StartOptions {
  /**
   * Saves the weigh-in that is due on the browser's date, so the Sunday dialog and the reminder
   * banner (RF-05, RF-06) never cover a screen whatever the weekday. Weigh-in tests turn it off.
   */
  weighInDone?: boolean;
  /** The profile to start with; another nickname and user id stand for a second friend. */
  profile?: Profile;
}

/**
 * Puts a profile in the app's own IndexedDB, as onboarding would, then reloads. The app creates
 * the database on its first start, so the store already exists at whatever schema version is current.
 */
export async function startWithProfile(
  page: Page,
  hash = '',
  { weighInDone = true, profile = sampleProfile }: StartOptions = {},
) {
  await page.goto('/');
  await page.getByRole('heading', { level: 1, name: 'Welcome' }).waitFor();
  const today = toCalendarDate(new Date(await page.evaluate(() => Date.now())));
  const records: [string, unknown][] = [['profile', profile]];
  if (weighInDone) {
    const weighIn = { week: weighInWeekFor(today), weightKg: 70, measuredOn: today };
    records.push(['weighIns', { ...weighIn, fastingConfirmed: true }]);
  }
  await page.evaluate(
    (records) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('vitapact');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const stores = records.map(([store]) => store);
          const transaction = request.result.transaction(stores, 'readwrite');
          for (const [store, record] of records) transaction.objectStore(store).put(record);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      }),
    records,
  );
  await page.goto(`/${hash}`);
  await page.reload();
}
