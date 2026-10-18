import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { GroupDialog, type GroupDialogProps, type GroupDialogText } from './GroupDialog';

const text: GroupDialogText = {
  title: 'Edit group',
  submit: 'Save group',
  cancel: 'Cancel',
  close: 'Close',
  name: 'Group name',
  stakeChoice: 'How do you pick the stake?',
  stakeOwn: 'We choose it',
  stakeRotating: 'A new one every week',
  stakeRotatingHint: 'The app picks one every week.',
  stake: 'Stake',
  stakePlaceholder: 'e.g. pizza',
  members: 'Members',
  noFriendsYet: 'No friends yet.',
  saveFailed: 'Could not save.',
  counter: (length, max) => `${length} / ${max}`,
  errors: {
    nameMissing: 'Give the group a name.',
    nameTooLong: 'Too long.',
    stakeMissing: 'Write what is at stake.',
    stakeTooLong: 'Too long.',
  },
};

const friends = [
  { userId: 'u1', nickname: 'Ada' },
  { userId: 'u2', nickname: 'Bo' },
];
const office = { name: 'Office', stake: 'brings the coffee', memberIds: ['u1'] };

function renderDialog(props: Partial<GroupDialogProps> = {}) {
  const all: GroupDialogProps = {
    opened: true,
    friends,
    text,
    onSave: vi.fn(() => Promise.resolve()),
    onClose: vi.fn(),
    ...props,
  };
  return { ...renderWithTheme(<GroupDialog {...all} />), props: all };
}

describe('F3-ST-02 RF-25 GroupDialog', () => {
  it('starts from the group being edited and saves the changes', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog({ initial: office });
    expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('Office');
    await user.click(screen.getByRole('checkbox', { name: 'Bo' }));
    await user.click(screen.getByRole('button', { name: 'Save group' }));
    expect(props.onSave).toHaveBeenCalledWith({
      ...office,
      stakeRotates: false,
      memberIds: ['u1', 'u2'],
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('F3-FR-10 lets the stake rotate every week, with no stake to write', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog({ initial: office });
    await user.click(screen.getByRole('radio', { name: 'A new one every week' }));
    expect(screen.queryByRole('textbox', { name: 'Stake' })).not.toBeInTheDocument();
    expect(screen.getByText('The app picks one every week.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save group' }));
    expect(props.onSave).toHaveBeenCalledWith({ ...office, stake: '', stakeRotates: true });
  });

  it("F3-FR-10 goes back to a stake of the group's own", async () => {
    const user = userEvent.setup();
    renderDialog({ initial: { ...office, stake: '', stakeRotates: true } });
    expect(screen.getByRole('radio', { name: 'A new one every week' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'We choose it' }));
    expect(screen.getByRole('textbox', { name: 'Stake' })).toHaveValue('');
  });

  it('shows the error core finds and saves nothing', async () => {
    const user = userEvent.setup();
    const { props } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Save group' }));
    expect(screen.getByText('Give the group a name.')).toBeInTheDocument();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('keeps what was typed when saving fails', async () => {
    const user = userEvent.setup();
    renderDialog({ initial: office, onSave: () => Promise.reject(new Error('disk')) });
    await user.click(screen.getByRole('button', { name: 'Save group' }));
    expect(await screen.findByText('Could not save.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('Office');
  });

  it('starts again from the initial group every time it opens', async () => {
    const user = userEvent.setup();
    const { rerender, props } = renderDialog({ initial: office });
    await user.clear(screen.getByRole('textbox', { name: 'Group name' }));
    rerender(<GroupDialog {...props} opened={false} />);
    rerender(<GroupDialog {...props} opened />);
    expect(screen.getByRole('textbox', { name: 'Group name' })).toHaveValue('Office');
  });
});
