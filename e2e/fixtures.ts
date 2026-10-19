import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { isAllowedRequest } from './support/networkGuard';

/** Aborts every request leaving the local app server and returns the list it collects. */
async function guardNetwork(context: BrowserContext, baseURL: string) {
  const forbiddenRequests: string[] = [];
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (isAllowedRequest(url, baseURL)) return route.continue();
    forbiddenRequests.push(url);
    return route.abort('blockedbyclient');
  });
  return forbiddenRequests;
}

/**
 * Every end-to-end test imports `test` from here, never from @playwright/test:
 * any request leaving the local app server is aborted and fails the test (RNF-01).
 * `friendPage` is a second device, with its own storage, for scenarios between two friends.
 */
export const test = base.extend<{ networkGuard: void; friendPage: Page }>({
  networkGuard: [
    async ({ context, baseURL }, use) => {
      const forbiddenRequests = await guardNetwork(context, baseURL!);
      await use();
      expect(forbiddenRequests, 'The app attempted network requests (RNF-01)').toEqual([]);
    },
    { auto: true },
  ],
  friendPage: async ({ browser, baseURL }, provide) => {
    const context = await browser.newContext({
      baseURL: baseURL!,
      viewport: { width: 1280, height: 800 },
    });
    const forbiddenRequests = await guardNetwork(context, baseURL!);
    await provide(await context.newPage());
    await context.close();
    expect(forbiddenRequests, 'The app attempted network requests (RNF-01)').toEqual([]);
  },
});

export { expect };
export type { Page };
