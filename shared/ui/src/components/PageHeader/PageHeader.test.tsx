import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { PageHeader } from './PageHeader';

describe('PageHeader (provisional, F1-01)', () => {
  it('renders the title as the page heading', () => {
    renderWithTheme(<PageHeader title="Today" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
  });

  it('renders subtitle and action when given', () => {
    renderWithTheme(<PageHeader title="Week" subtitle="2026-W41" action={<button>Act</button>} />);
    expect(screen.getByText('2026-W41')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
  });
});
