import { test as base, expect } from '@playwright/test';
import { isAllowedRequest } from './support/networkGuard';

/**
 * Every end-to-end test imports `test` from here, never from @playwright/test:
 * any request leaving the local app server is aborted and fails the test (RNF-01).
 */
export const test = base.extend<{ networkGuard: void }>({
  networkGuard: [
    async ({ context, baseURL }, use) => {
      const forbiddenRequests: string[] = [];
      await context.route('**/*', (route) => {
        const url = route.request().url();
        if (isAllowedRequest(url, baseURL!)) return route.continue();
        forbiddenRequests.push(url);
        return route.abort('blockedbyclient');
      });
      await use();
      expect(forbiddenRequests, 'The app attempted network requests (RNF-01)').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
