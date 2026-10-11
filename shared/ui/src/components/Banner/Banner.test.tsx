import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { Banner } from './Banner';

describe('F2-16 Banner', () => {
  it.each([
    ['warning', 'var(--vp-color-warning)'],
    ['info', 'var(--vp-color-primary-soft)'],
  ] as const)('the %s tone uses its background and dark text', (tone, background) => {
    renderWithTheme(<Banner tone={tone}>Weigh in today</Banner>);
    expect(screen.getByRole('status')).toHaveStyle({
      backgroundColor: background,
      color: 'var(--vp-color-text)',
    });
  });

  it('announces its message and shows the action', () => {
    renderWithTheme(
      <Banner tone="warning" icon="weighIn" action={<button>Weigh in</button>}>
        Weigh in today
      </Banner>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Weigh in today');
    expect(screen.getByRole('button', { name: 'Weigh in' })).toBeInTheDocument();
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <Banner tone="info" icon="info" action={<button>Open</button>}>
        Message
      </Banner>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
