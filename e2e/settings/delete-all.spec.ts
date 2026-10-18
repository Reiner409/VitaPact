import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

test.describe('F3-ST-04 RF-20 delete all data from settings', () => {
  test('asks twice, deletes everything and starts again from the welcome', async ({ page }) => {
    await startWithProfile(page, '#/settings');
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete all data' }).click();
    await page
      .getByRole('dialog', { name: 'Delete everything?' })
      .getByRole('button', { name: 'Continue' })
      .click();
    const second = page.getByRole('dialog', { name: 'Are you sure?' });
    await second.getByLabel('Type DELETE').fill('DELETE');
    await second.getByRole('button', { name: 'Delete all data' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
  });
});

test.describe('F3-ST-02 RF-25 groups in settings', () => {
  test('creates a group in settings and finds it on Friends', async ({ page }) => {
    await startWithProfile(page, '#/settings');
    await page.getByRole('button', { name: 'New group' }).click();
    const dialog = page.getByRole('dialog', { name: 'New group' });
    await dialog.getByLabel('Group name').fill('Office');
    await dialog.getByLabel('Stake', { exact: true }).fill('brings the coffee');
    await dialog.getByRole('button', { name: 'Create group' }).click();
    await expect(page.getByRole('heading', { name: 'Office' })).toBeVisible();
    await expect(dialog).toBeHidden();
    await page.screenshot({ path: 'e2e/settings/screenshots/S4-groups-1280.png', fullPage: true });

    await page.getByRole('navigation').getByRole('button', { name: 'Friends' }).click();
    await expect(page.getByText('At stake: brings the coffee')).toBeVisible();
  });
});
