import { expect, test } from './fixtures';

test.describe('F1-07 RNF-01 the app cannot open network connections', () => {
  test('the built page carries the Content Security Policy', async ({ page }) => {
    await page.goto('/');
    const policy = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content');
    expect(policy).toContain('connect-src ipc: http://ipc.localhost');
  });

  test('a fetch to the internet is blocked by the policy', async ({ page }) => {
    await page.goto('/');
    const outcome = await page.evaluate(async () => {
      const violation = new Promise<string>((resolve) =>
        document.addEventListener('securitypolicyviolation', (event) =>
          resolve(event.violatedDirective),
        ),
      );
      const request = fetch('https://example.com/').then(
        () => 'sent',
        () => 'blocked',
      );
      return { request: await request, violated: await violation };
    });
    expect(outcome).toEqual({ request: 'blocked', violated: 'connect-src' });
  });

  test('a fetch to another local port is blocked too', async ({ page }) => {
    await page.goto('/');
    const outcome = await page.evaluate(() =>
      fetch('http://localhost:9/').then(
        () => 'sent',
        () => 'blocked',
      ),
    );
    expect(outcome).toBe('blocked');
  });
});
