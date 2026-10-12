import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import type { ScoreBand } from '../scoreBand';
import { VerdictLabel } from './VerdictLabel';

const BANDS: ScoreBand[] = ['pauseWeek', 'lightWeek', 'solidBase', 'onIt', 'greatShape'];

describe('F2-18 VerdictLabel', () => {
  it('RF-15 shows the translated verdict with the dot of its band', () => {
    renderWithTheme(<VerdictLabel band="onIt">On it</VerdictLabel>);
    const verdict = screen.getByText('On it');
    expect(verdict).toHaveAttribute('data-band', 'onIt');
    expect(verdict.parentElement?.querySelector('[data-band="onIt"][aria-hidden]')).not.toBeNull();
  });

  it.each(BANDS)('RF-15 keeps the "%s" verdict in the text colour, never in clay', (band) => {
    renderWithTheme(<VerdictLabel band={band}>Verdict</VerdictLabel>);
    const verdict = screen.getByText('Verdict');
    expect(verdict).toHaveStyle({ color: 'var(--vp-color-text)' });
    expect(verdict.parentElement?.outerHTML).not.toContain('danger');
  });

  it('shows the verdict as text, never as markup', () => {
    renderWithTheme(<VerdictLabel band="solidBase">{'<b>Solid base</b>'}</VerdictLabel>);
    expect(screen.getByText('<b>Solid base</b>')).toBeInTheDocument();
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<VerdictLabel band="greatShape">In great shape</VerdictLabel>);
    expect(await axeViolations()).toEqual([]);
  });
});
