import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { WeighInDialog, type WeighInDialogLabels } from './WeighInDialog';

const labels: WeighInDialogLabels = {
  title: 'Sunday weigh-in',
  close: 'Close',
  weight: 'Weight',
  unit: 'kg',
  fasting: 'I weighed myself on an empty stomach, before breakfast',
  save: 'Save',
  later: 'Later',
  outOfRange: 'Enter a weight between 20 and 400 kg',
};

function renderDialog() {
  const onSave = vi.fn();
  const onLater = vi.fn();
  renderWithTheme(
    <WeighInDialog
      opened
      labels={labels}
      minKg={20}
      maxKg={400}
      onSave={onSave}
      onLater={onLater}
    />,
  );
  return { onSave, onLater };
}

const weight = () => screen.getByRole('textbox', { name: 'Weight' });
const fasting = () => screen.getByRole('checkbox', { name: labels.fasting });
const save = () => screen.getByRole('button', { name: 'Save' });

describe('F2-18 WeighInDialog', () => {
  it('RF-05 is a dialog asking for the weight with the empty-stomach confirmation', () => {
    renderDialog();
    expect(screen.getByRole('dialog', { name: 'Sunday weigh-in' })).toBeInTheDocument();
    expect(weight()).toBeInTheDocument();
    expect(fasting()).not.toBeChecked();
  });

  it('RF-05 does not save without the empty-stomach checkbox', async () => {
    const { onSave } = renderDialog();
    await userEvent.type(weight(), '78.4');
    expect(save()).toBeDisabled();
    await userEvent.click(save());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('RF-05 does not save without a weight', async () => {
    renderDialog();
    await userEvent.click(fasting());
    expect(save()).toBeDisabled();
  });

  it('RF-05 saves the weight in kg once confirmed', async () => {
    const { onSave } = renderDialog();
    await userEvent.type(weight(), '78.4');
    await userEvent.click(fasting());
    await userEvent.click(save());
    expect(onSave).toHaveBeenCalledWith(78.4);
  });

  it('RF-05 explains a weight out of range instead of saving it', async () => {
    const { onSave } = renderDialog();
    await userEvent.type(weight(), '7');
    await userEvent.click(fasting());
    await userEvent.click(save());
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(labels.outOfRange);
  });

  it('RF-06 postpones with "Later"', async () => {
    const { onLater, onSave } = renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(onLater).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('RNF-10 keeps the checkbox label, which also ticks it, a 44 px target', () => {
    renderDialog();
    expect(screen.getByText(labels.fasting)).toHaveStyle({ minHeight: '44px' });
  });

  it('RNF-10 has no axe violations', async () => {
    renderDialog();
    expect(await axeViolations()).toEqual([]);
  });
});
