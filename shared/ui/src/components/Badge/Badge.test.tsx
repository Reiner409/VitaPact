import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { Badge } from './Badge';

describe('F2-17 Badge', () => {
  it.each([
    ['neutral', 'var(--vp-color-surface)'],
    ['comeback', 'var(--vp-color-primary-soft)'],
    ['waiting', 'var(--vp-color-sidebar)'],
  ] as const)('the %s variant has its background and readable text', (variant, background) => {
    renderWithTheme(<Badge variant={variant}>Label</Badge>);
    const badge = screen.getByText('Label').closest('[data-variant]');
    expect(badge).toHaveAttribute('data-variant', variant);
    expect(badge).toHaveStyle({ backgroundColor: background });
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <>
        <Badge>You</Badge>
        <Badge variant="comeback">Comeback</Badge>
        <Badge variant="waiting">Waiting</Badge>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
