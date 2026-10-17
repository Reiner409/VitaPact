import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tokens } from '../../tokens';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { Stack } from './Stack';

describe('F2-16 Stack', () => {
  it.each([
    ['tight', tokens.space[2]],
    ['normal', tokens.space[4]],
    ['loose', tokens.space[5]],
  ] as const)('the %s gap leaves %i px between blocks', (gap, pixels) => {
    renderWithTheme(
      <Stack gap={gap}>
        <p>First</p>
        <p>Second</p>
      </Stack>,
    );
    const stack = screen.getByText('First').parentElement;
    expect(stack).toHaveAttribute('data-gap', gap);
    expect(stack?.style.getPropertyValue('--stack-gap')).toBe(
      `calc(${pixels / 16}rem * var(--mantine-scale))`,
    );
  });

  it('puts blocks side by side when horizontal', () => {
    renderWithTheme(
      <Stack horizontal>
        <p>First</p>
        <p>Second</p>
      </Stack>,
    );
    const row = screen.getByText('First').parentElement;
    expect(row?.style.getPropertyValue('--group-gap')).toBe('calc(1rem * var(--mantine-scale))');
  });

  it('F3-WK-02 lays blocks out in a grid when given columns', () => {
    renderWithTheme(
      <Stack columns={4}>
        <p>First</p>
        <p>Second</p>
      </Stack>,
    );
    const grid = screen.getByText('First').parentElement;
    expect(grid).toHaveClass('mantine-SimpleGrid-root');
    expect(grid).toHaveAttribute('data-gap', 'normal');
  });
});
