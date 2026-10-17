import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { axeViolations, setViewportWidth } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { SplitView } from './SplitView';

const list = <p>The list</p>;
const detail = <p>The detail</p>;
const placeholder = <p>Pick one</p>;

describe('F2-16 SplitView RF-29', () => {
  afterEach(() => setViewportWidth(390));

  it('shows the list and the open detail side by side on a wide window', () => {
    setViewportWidth(1280);
    renderWithTheme(<SplitView list={list} detail={detail} placeholder={placeholder} />);
    expect(screen.getByText('The list')).toBeInTheDocument();
    expect(screen.getByText('The detail')).toBeInTheDocument();
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
  });

  it('shows the placeholder beside the list while nothing is open', () => {
    setViewportWidth(1280);
    renderWithTheme(<SplitView list={list} placeholder={placeholder} />);
    expect(screen.getByText('The list')).toBeInTheDocument();
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('shows the open detail in place of the list on a narrow window', () => {
    setViewportWidth(390);
    renderWithTheme(<SplitView list={list} detail={detail} placeholder={placeholder} />);
    expect(screen.queryByText('The list')).not.toBeInTheDocument();
    expect(screen.getByText('The detail')).toBeInTheDocument();
  });

  it('shows only the list on a narrow window while nothing is open', () => {
    setViewportWidth(390);
    renderWithTheme(<SplitView list={list} placeholder={placeholder} />);
    expect(screen.getByText('The list')).toBeInTheDocument();
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
  });

  it('RNF-10 has no axe violations', async () => {
    setViewportWidth(1280);
    renderWithTheme(<SplitView list={list} detail={detail} />);
    expect(await axeViolations()).toEqual([]);
  });
});
