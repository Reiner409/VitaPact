import axe from 'axe-core';

/**
 * Runs axe on rendered markup and returns one readable line per violation.
 * Colour contrast is left out because jsdom has no layout; the token tests cover it (RNF-10).
 * The landmark rule is left out because components are tested outside a full page.
 */
export async function axeViolations(context: Element = document.body): Promise<string[]> {
  const { violations } = await axe.run(context, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return violations.map(
    ({ id, help, nodes }) => `${id}: ${help} (${nodes.map(({ html }) => html).join(', ')})`,
  );
}
