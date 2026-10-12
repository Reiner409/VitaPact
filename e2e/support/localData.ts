import type { Page } from '../fixtures';
import { sampleProfile } from '@vitapact/core/storage/testing';

/**
 * Puts a profile in the app's own IndexedDB, as onboarding would, then reloads. The app creates
 * the database on its first start, so the store already exists at whatever schema version is current.
 */
export async function startWithProfile(page: Page, hash = '') {
  await page.goto('/');
  await page.getByRole('heading', { level: 1, name: 'Welcome' }).waitFor();
  await page.evaluate(
    (profile) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('vitapact');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const transaction = request.result.transaction('profile', 'readwrite');
          transaction.objectStore('profile').put(profile);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      }),
    sampleProfile,
  );
  await page.goto(`/${hash}`);
  await page.reload();
}
