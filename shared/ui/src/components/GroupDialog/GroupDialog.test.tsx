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
    expect(props.onSave).toHaveBeenCalledWith({ ...office, memberIds: ['u1', 'u2'] });
    expect(props.onClose).toHaveBeenCalled();
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
