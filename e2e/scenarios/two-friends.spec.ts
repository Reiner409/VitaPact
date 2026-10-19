import { sampleProfile } from '@vitapact/core/storage/testing';
import { expect, test, type Page } from '../fixtures';
import { startWithProfile } from '../support/localData';
import {
  GOOD_DAY,
  POOR_DAY,
  addPastedReport,
  createGroup,
  logDay,
  pastePng,
  saveWeeklyReport,
} from '../support/scenario';

const SUNDAY_EVENING = new Date('2026-10-18T21:00:00');
const bea = { ...sampleProfile, userId: '7b1d2e3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f', nickname: 'Bea' };

async function openFriends(page: Page) {
  await page.getByRole('navigation').getByRole('button', { name: 'Friends' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Friends' })).toBeVisible();
}

test.describe('F4-01 two friends on two devices (section 3, scenarios 5 and 6, RF-26)', () => {
  test('swap their weekly reports and see the same ranking and the same payer', async ({
    page: rei,
    friendPage: beaPage,
  }) => {
    for (const [device, profile, day] of [
      [rei, sampleProfile, GOOD_DAY],
      [beaPage, bea, POOR_DAY],
    ] as const) {
      await device.emulateMedia({ reducedMotion: 'reduce' });
      await device.clock.setFixedTime(SUNDAY_EVENING);
      await startWithProfile(device, '', { profile });
      await logDay(device, day);
    }
    const reiReport = await saveWeeklyReport(rei);
    const beaReport = await saveWeeklyReport(beaPage);

    for (const [device, friend, report] of [
      [rei, 'Bea', beaReport],
      [beaPage, 'Rei', reiReport],
    ] as const) {
      await openFriends(device);
      await createGroup(device, 'Pact', 'the pizza');
      await pastePng(device, report);
      await addPastedReport(device, friend, 'Pact');
    }

    const weekend = (device: Page) => device.getByRole('region', { name: 'This weekend' });
    // Both devices pick Bea; on her own device the phrase speaks to her, so the words differ.
    for (const device of [rei, beaPage]) {
      await expect(weekend(device)).toContainText('Bea');
      await expect(weekend(device)).toContainText('the pizza');
      await expect(weekend(device)).not.toContainText('Rei');
    }

    const ranking = (device: Page) => device.getByRole('list', { name: 'Week 42 ranking' });
    // The same places and scores on both devices; only the "You" label moves to its owner.
    const rows = async (device: Page) => (await ranking(device).innerText()).replace('\nYou', '');
    expect(await rows(beaPage)).toBe(await rows(rei));
    await expect(ranking(rei).getByRole('listitem').first()).toContainText('Rei');
  });
});
