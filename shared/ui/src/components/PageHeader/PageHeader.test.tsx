import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { PageHeader } from './PageHeader';

describe('F2-16 PageHeader', () => {
  it('renders the title as the page heading', () => {
    renderWithTheme(<PageHeader title="Today" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
  });

  it('renders subtitle and action when given', () => {
    renderWithTheme(<PageHeader title="Week" subtitle="2026-W41" action={<button>Act</button>} />);
    expect(screen.getByText('2026-W41')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
  });

  it('renders no subtitle or action when not given', () => {
    const { container } = renderWithTheme(<PageHeader title="Week" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<PageHeader title="Week" subtitle="2026-W41" action={<button>Act</button>} />);
    expect(await axeViolations()).toEqual([]);
  });
});
