import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { WeighInBanner } from './WeighInBanner';

function renderBanner(onWeighIn = vi.fn()) {
  renderWithTheme(
    <WeighInBanner
      message="Sunday weigh-in still to do: you have until Tuesday."
      actionLabel="Weigh in"
      onWeighIn={onWeighIn}
    />,
  );
  return onWeighIn;
}

describe('F2-18 WeighInBanner', () => {
  it('RF-06 shows the weigh-in reminder as a warning with the scale icon', () => {
    renderBanner();
    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Sunday weigh-in still to do: you have until Tuesday.');
    expect(banner).toHaveAttribute('data-tone', 'warning');
    expect(banner.querySelector('[data-icon="weighIn"]')).not.toBeNull();
  });

  it('reopens the weigh-in from the banner', async () => {
    const onWeighIn = renderBanner();
    await userEvent.click(screen.getByRole('button', { name: 'Weigh in' }));
    expect(onWeighIn).toHaveBeenCalledTimes(1);
  });

  it('RNF-10 has no axe violations', async () => {
    renderBanner();
    expect(await axeViolations()).toEqual([]);
  });
});
