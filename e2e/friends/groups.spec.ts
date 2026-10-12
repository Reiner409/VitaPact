import { expect, test } from '../fixtures';
import { startWithProfile } from '../support/localData';

const screenshot = (width: number) => `e2e/friends/screenshots/F1-${width}.png`;

test.describe('RF-25 groups on the Friends screen', () => {
  for (const width of [1280, 390]) {
    test(`creates a group from the empty state and keeps it after a reload (${width} px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await startWithProfile(page, '#/friends');
      await expect(page.getByRole('heading', { name: 'No groups yet' })).toBeVisible();

      await page.getByRole('button', { name: 'New group' }).click();
      const dialog = page.getByRole('dialog', { name: 'New group' });
      await dialog.getByLabel('Group name').fill('Five-a-side');
      await dialog.getByLabel('Stake').fill('whoever falls behind buys the pizza');
      await dialog.getByRole('button', { name: 'Create group' }).click();
      await expect(dialog).toBeHidden();

      await page.reload();
      await expect(page.getByRole('combobox', { name: 'Group' })).toHaveValue('Five-a-side');
      await expect(page.getByText('At stake: whoever falls behind buys the pizza')).toBeVisible();
      await page.screenshot({ path: screenshot(width), fullPage: true });
    });
  }
});
