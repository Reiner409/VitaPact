import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { axeViolations, setViewportWidth } from '../../testing';
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
    renderWithTheme(<PageHeader title="Week" />);
    expect(screen.queryByText('2026-W41')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  describe('RF-29 on a phone', () => {
    afterEach(() => setViewportWidth(390));

    it('puts the action on its own row under the title', () => {
      setViewportWidth(390);
      renderWithTheme(<PageHeader title="Friends" action={<button>Add report</button>} />);
      expect(
        screen.getByRole('button', { name: 'Add report' }).closest('.mantine-Group-root'),
      ).toBeNull();
    });

    it('keeps the action beside the title on a wide window', () => {
      setViewportWidth(1280);
      renderWithTheme(<PageHeader title="Friends" action={<button>Add report</button>} />);
      expect(
        screen.getByRole('button', { name: 'Add report' }).closest('.mantine-Group-root'),
      ).not.toBeNull();
    });
  });

  it('shows the greeting above the title when given', () => {
    renderWithTheme(<PageHeader title="Today" greeting="Good morning, Rei" />);
    expect(screen.getByText('Good morning, Rei')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <PageHeader
        title="Week"
        greeting="Good evening, Rei"
        subtitle="2026-W41"
        action={<button>Act</button>}
      />,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
