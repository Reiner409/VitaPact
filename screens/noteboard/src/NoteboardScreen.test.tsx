import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openTestDatabase, sampleNote } from '@vitapact/core/storage/testing';
import { getNote, saveNote } from '@vitapact/core/storage/notes';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it } from 'vitest';
import en from '../locales/en/noteboard.json';
import { NoteboardScreen } from './NoteboardScreen';

describe('RF-17 Noteboard on the local database', () => {
  it('lists the saved notes and deletes one from the database', async () => {
    const db = await openTestDatabase();
    await saveNote(db, sampleNote);
    renderWithProviders(<NoteboardScreen db={db} />, { translations: { noteboard: en } });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /Session/ }));
    await user.click(screen.getByRole('button', { name: en.actions.delete }));
    await user.click(await screen.findByRole('button', { name: en.delete.confirm }));

    expect(await screen.findByRole('heading', { name: en.empty.title })).toBeInTheDocument();
    expect(await getNote(db, sampleNote.id)).toBeUndefined();
  });
});
