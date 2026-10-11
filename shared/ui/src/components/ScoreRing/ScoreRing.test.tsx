import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { VerdictLabel } from '../VerdictLabel/VerdictLabel';
import { ScoreRing } from './ScoreRing';

const ringArc = () => document.querySelector('[data-ring="progress"]');

describe('F2-18 ScoreRing', () => {
  it('RF-09 is a 0-100 meter named by its label, with the score as a large number', () => {
    renderWithTheme(<ScoreRing score={62} label="Week score" />);
    const meter = screen.getByRole('meter', { name: 'Week score' });
    expect(meter).toHaveAttribute('aria-valuenow', '62');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('62')).toHaveStyle({ fontSize: '48px' });
  });

  it('RF-09 fills the ring in the primary green in proportion to the score', () => {
    renderWithTheme(<ScoreRing score={25} label="Day score" />);
    expect(ringArc()).toHaveAttribute('stroke', 'var(--vp-color-primary)');
    expect(ringArc()).toHaveAttribute('pathLength', '100');
    expect(ringArc()).toHaveAttribute('stroke-dasharray', '25 100');
  });

  it.each([
    [-5, '0'],
    [140, '100'],
    [71.6, '72'],
  ])('RF-09 shows %s as %s', (score, shown) => {
    renderWithTheme(<ScoreRing score={score} label="Week score" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', shown);
    expect(screen.getByText(shown)).toBeInTheDocument();
  });

  it('RF-15 shows the verdict below the score', () => {
    renderWithTheme(
      <ScoreRing score={88} label="Week score">
        <VerdictLabel band="greatShape">In great shape</VerdictLabel>
      </ScoreRing>,
    );
    expect(screen.getByText('In great shape')).toBeInTheDocument();
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<ScoreRing score={40} label="Week score" />);
    expect(await axeViolations()).toEqual([]);
  });
});
