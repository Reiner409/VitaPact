import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveProfile } from '@vitapact/core/storage';
import { getNote, listNotes, saveNote } from '@vitapact/core/storage/notes';
import { openTestDatabase, sampleNote, sampleProfile } from '@vitapact/core/storage/testing';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it } from 'vitest';
import en from '../../locales/en/noteboard.json';
import { NoteboardScreen } from '../NoteboardScreen';

const password = 'blue whale';
type User = ReturnType<typeof userEvent.setup>;

async function renderBoard() {
  const db = await openTestDatabase();
  await saveProfile(db, sampleProfile);
  await saveNote(db, sampleNote);
  const clock = { now: () => new Date('2026-10-12T09:00:00.000Z'), newId: () => 'note-new' };
  renderWithProviders(<NoteboardScreen db={db} clock={clock} />, {
    translations: { noteboard: en },
  });
  await screen.findByRole('button', { name: /Session/ });
  return { db, user: userEvent.setup() };
}

async function setPassword(user: User, first = password, second = password) {
  await user.click(screen.getByRole('button', { name: en.lock.set.open }));
  const dialog = await screen.findByRole('dialog', { name: en.lock.set.title });
  if (first) await user.type(within(dialog).getByLabelText(en.lock.set.password), first);
  if (second) await user.type(within(dialog).getByLabelText(en.lock.set.repeat), second);
  await user.click(within(dialog).getByRole('button', { name: en.lock.set.confirm }));
  return dialog;
}

async function unlock(user: User, typed: string) {
  const field = await screen.findByLabelText(en.lock.password);
  await user.clear(field);
  await user.type(field, typed);
  await user.click(screen.getByRole('button', { name: en.lock.unlock }));
}

describe('F3-NB-04 RF-18 set the Noteboard password', () => {
  it('warns that it cannot be recovered and needs the same password twice', async () => {
    const { db, user } = await renderBoard();
    const dialog = await setPassword(user, password, 'blue whal');
    expect(within(dialog).getByText(en.lock.set.warning)).toBeInTheDocument();
    expect(within(dialog).getByText(en.lock.set.mismatch)).toBeInTheDocument();
    expect((await getNote(db, sampleNote.id))?.kind).toBe('plain');
  });

  it('seals the notes on disk and keeps showing them while unlocked', async () => {
    const { db, user } = await renderBoard();
    await setPassword(user);
    expect(await screen.findByRole('button', { name: en.lock.lockNow })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Session/ })).toBeInTheDocument();
    const stored = JSON.stringify(await listNotes(db));
    expect(stored).not.toContain('We talked about sleep.');
    expect(stored).not.toContain('therapy');
  });
});

describe('F3-NB-05 RF-18 lock and unlock', () => {
  it('locks now, refuses a wrong password and opens with the right one', async () => {
    const { user } = await renderBoard();
    await setPassword(user);
    await user.click(await screen.findByRole('button', { name: en.lock.lockNow }));
    expect(await screen.findByText(en.lock.lockedSubtitle)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Session/ })).not.toBeInTheDocument();

    await unlock(user, 'red whale');
    expect(await screen.findByText(en.lock.wrong)).toBeInTheDocument();
    await unlock(user, password);
    expect(await screen.findByRole('button', { name: /Session/ })).toBeInTheDocument();
  });

  it('seals a note written while unlocked', async () => {
    const { db, user } = await renderBoard();
    await setPassword(user);
    await screen.findByRole('button', { name: en.lock.lockNow });
    await user.click(await screen.findByRole('button', { name: en.actions.new }));
    await user.type(screen.getByLabelText(en.editor.title), 'Secret plan');
    await user.click(screen.getByRole('button', { name: en.actions.save }));
    expect(await screen.findByRole('button', { name: /Secret plan/ })).toBeInTheDocument();
    expect((await getNote(db, 'note-new'))?.kind).toBe('protected');
  });
});

describe('F3-NB-06 RF-18 remove the password', () => {
  it('needs the current password, then puts the notes back in plain text', async () => {
    const { db, user } = await renderBoard();
    await setPassword(user);
    await user.click(await screen.findByRole('button', { name: en.lock.remove.open }));
    const dialog = await screen.findByRole('dialog', { name: en.lock.remove.title });
    const field = within(dialog).getByLabelText(en.lock.remove.password);
    await user.type(field, 'wrong');
    await user.click(within(dialog).getByRole('button', { name: en.lock.remove.confirm }));
    expect(await within(dialog).findByText(en.lock.wrong)).toBeInTheDocument();

    await user.clear(field);
    await user.type(field, password);
    await user.click(within(dialog).getByRole('button', { name: en.lock.remove.confirm }));
    expect(await screen.findByRole('button', { name: en.lock.set.open })).toBeInTheDocument();
    expect(await getNote(db, sampleNote.id)).toEqual(sampleNote);
  });
});
