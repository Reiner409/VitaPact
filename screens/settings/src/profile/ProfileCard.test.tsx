import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axeViolations, renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it, vi } from 'vitest';
import en from '../../locales/en/settings.json';
import { ProfileCard, type ProfileCardProps } from './ProfileCard';
import { sampleProfile as testProfile } from '@vitapact/core/storage/testing';

function renderCard(props: Partial<ProfileCardProps> = {}) {
  const onSave = vi.fn<ProfileCardProps['onSave']>().mockResolvedValue();
  const onCopyUserId = vi.fn<ProfileCardProps['onCopyUserId']>().mockResolvedValue();
  renderWithProviders(
    <ProfileCard profile={testProfile} onSave={onSave} onCopyUserId={onCopyUserId} {...props} />,
    { translations: { settings: en } },
  );
  return { onSave, onCopyUserId, user: userEvent.setup() };
}

const field = (label: string) => screen.getByRole('textbox', { name: label });
const goalField = (key: keyof typeof en.profile.goals) => field(en.profile.goals[key].label);

async function replace(user: ReturnType<typeof userEvent.setup>, input: HTMLElement, text: string) {
  await user.clear(input);
  if (text) await user.type(input, text);
}

describe('RF-01 edit the profile in settings', () => {
  it('shows the stored nickname and goals', () => {
    renderCard();
    expect(field(en.profile.nickname)).toHaveValue('Rei');
    expect(goalField('sleepHours')).toHaveValue('7.5');
    expect(goalField('workoutsPerWeek')).toHaveValue('3');
    expect(goalField('sunMinutes')).toHaveValue('20');
  });

  it('saves the changed nickname, goals and hide-weight choice', async () => {
    const { onSave, user } = renderCard();
    await replace(user, field(en.profile.nickname), 'Sam');
    await replace(user, goalField('workoutsPerWeek'), '4');
    const hideWeight = screen.getByRole('group', { name: en.profile.hideWeight });
    await user.click(within(hideWeight).getByRole('button', { name: en.profile.yes }));
    await user.click(screen.getByRole('button', { name: en.profile.save }));
    expect(onSave).toHaveBeenCalledWith({
      ...testProfile,
      nickname: 'Sam',
      goals: { ...testProfile.goals, workoutsPerWeek: 4 },
      hideWeight: true,
    });
    expect(await screen.findByRole('status')).toHaveTextContent(en.profile.notices.saved);
  });

  it('does not save an empty nickname and says why', async () => {
    const { onSave, user } = renderCard();
    await replace(user, field(en.profile.nickname), '');
    await user.click(screen.getByRole('button', { name: en.profile.save }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(en.profile.errors.nicknameRequired)).toBeInTheDocument();
  });

  it('does not save a goal outside its range and shows the range', async () => {
    const { onSave, user } = renderCard();
    await replace(user, goalField('sleepHours'), '13');
    await user.click(screen.getByRole('button', { name: en.profile.save }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Choose a value from 4 to 12.')).toBeInTheDocument();
  });

  it('tells the user when the profile could not be saved', async () => {
    const { user } = renderCard({ onSave: vi.fn().mockRejectedValue(new Error('disk full')) });
    await user.click(screen.getByRole('button', { name: en.profile.save }));
    expect(await screen.findByRole('alert')).toHaveTextContent(en.profile.notices.saveFailed);
  });

  it('has no accessibility violations', async () => {
    renderCard();
    expect(await axeViolations()).toEqual([]);
  });
});

describe('RF-02 the user id in settings', () => {
  it('shows the user id as text that cannot be edited', () => {
    renderCard();
    expect(screen.getByText(testProfile.userId)).toBeInTheDocument();
    const values = screen.getAllByRole('textbox').map((input) => (input as HTMLInputElement).value);
    expect(values).not.toContain(testProfile.userId);
  });

  it('copies the user id', async () => {
    const { onCopyUserId, user } = renderCard();
    await user.click(screen.getByRole('button', { name: en.profile.copyUserId }));
    expect(onCopyUserId).toHaveBeenCalledWith(testProfile.userId);
    expect(await screen.findByRole('status')).toHaveTextContent(en.profile.notices.copied);
  });
});
