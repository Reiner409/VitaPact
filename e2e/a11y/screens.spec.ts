import type axe from 'axe-core';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test, type Page } from '../fixtures';
import { startWithProfile } from '../support/localData';

const SCREENSHOTS = 'e2e/a11y/screenshots';
const MONDAY_EVENING = new Date('2026-10-12T21:00:00');
const WIDTHS = [360, 1024] as const;
const axeSource = readFileSync(
  createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
  'utf8',
);

interface ScreenCase {
  id: string;
  heading: string;
  hash: string;
}

const SCREENS: readonly ScreenCase[] = [
  { id: 'today', heading: 'Today', hash: '' },
  { id: 'week', heading: 'Week', hash: '#/week' },
  { id: 'friends', heading: 'Friends', hash: '#/friends' },
  { id: 'noteboard', heading: 'Noteboard', hash: '#/noteboard' },
  { id: 'settings', heading: 'Settings', hash: '#/settings' },
];

/** Runs axe in the page against WCAG 2.1 AA, colour contrast included, one line per problem. */
async function axeViolations(page: Page): Promise<string[]> {
  await page.evaluate(axeSource);
  return page.evaluate(async () => {
    const { violations } = await (window as unknown as { axe: typeof axe }).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
    return violations.map(
      ({ id, nodes }) => `${id}: ${nodes.map(({ target }) => target.join(' ')).join(', ')}`,
    );
  });
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function checkScreen(page: Page, name: string, width: number) {
  expect(await horizontalOverflow(page), `${name} scrolls sideways at ${width} px`).toBe(0);
  expect(await axeViolations(page), `${name} at ${width} px`).toEqual([]);
  await page.screenshot({ path: `${SCREENSHOTS}/${name}-${width}.png`, fullPage: true });
}

test.describe('F4-02 every screen passes axe and fits the window (RNF-10, RF-29)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.setFixedTime(MONDAY_EVENING);
  });

  for (const width of WIDTHS) {
    test(`RNF-10 RF-29 the welcome at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
      await checkScreen(page, 'welcome', width);
    });

    for (const screen of SCREENS) {
      test(`RNF-10 RF-29 ${screen.id} at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await startWithProfile(page, screen.hash);
        await expect(
          page.getByRole('heading', { level: 1, name: new RegExp(screen.heading) }),
        ).toBeVisible();
        await checkScreen(page, screen.id, width);
      });
    }
  }
});

interface DialogCase {
  id: string;
  hash: string;
  /** Opens the dialog, or the state, from the screen it belongs to. */
  open: (page: Page) => Promise<void>;
}

const DIALOGS: readonly DialogCase[] = [
  {
    id: 'today-missing-answers',
    hash: '',
    open: async (page) => {
      await page.getByRole('button', { name: 'Save day' }).click();
      await expect(page.getByRole('alert').first()).toBeVisible();
    },
  },
  {
    id: 'week-report',
    hash: '#/week',
    open: async (page) => {
      await page.getByRole('button', { name: 'Create report' }).click();
      await expect(page.getByRole('dialog', { name: 'Weekly report' })).toBeVisible();
    },
  },
  {
    id: 'friends-new-group',
    hash: '#/friends',
    open: async (page) => {
      await page.getByRole('button', { name: 'New group' }).first().click();
      await expect(page.getByRole('dialog', { name: 'New group' })).toBeVisible();
    },
  },
  {
    id: 'noteboard-editor',
    hash: '#/noteboard',
    open: async (page) => {
      await page.getByRole('button', { name: 'New note' }).first().click();
      await expect(page.getByRole('textbox', { name: 'Title' })).toBeVisible();
    },
  },
];

test.describe('F4-02 dialogs and error states pass axe and fit the window (RNF-10, RF-29)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.setFixedTime(MONDAY_EVENING);
  });

  for (const width of WIDTHS) {
    for (const dialog of DIALOGS) {
      test(`RNF-10 RF-29 ${dialog.id} at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await startWithProfile(page, dialog.hash);
        await dialog.open(page);
        await checkScreen(page, dialog.id, width);
      });
    }
  }
});

test.describe('F4-02 keyboard pass (RNF-10)', () => {
  test('RNF-10 reaches every screen from the navigation with Tab and Enter, focus always visible', async ({
    page,
  }) => {
    await startWithProfile(page);
    for (const screen of SCREENS.slice(1)) {
      await page.locator('body').focus();
      const target = page.getByRole('navigation').getByRole('button', { name: screen.heading });
      for (let presses = 0; presses < 60; presses += 1) {
        if (await target.evaluate((element) => element === document.activeElement)) break;
        await page.keyboard.press('Tab');
        const ring = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || active === document.body) return 'none needed';
          const { outlineStyle, outlineWidth } = getComputedStyle(active);
          return outlineStyle === 'none' || outlineWidth === '0px' ? active.outerHTML : 'shown';
        });
        expect(ring, 'the focused element shows a focus ring').toMatch(/^(none needed|shown)$/);
      }
      await expect(target).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(
        page.getByRole('heading', { level: 1, name: new RegExp(screen.heading) }),
      ).toBeVisible();
    }
  });
});
