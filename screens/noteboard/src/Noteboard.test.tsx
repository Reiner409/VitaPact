import type { Note } from '@vitapact/core/storage/notes';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it } from 'vitest';
import en from '../locales/en/noteboard.json';
import { Noteboard } from './Noteboard';
import type { NotesStore } from './notes/notesStore';

const savedNote: Note = {
  id: 'note-1',
  kind: 'plain',
  title: 'Session',
  body: 'We talked about sleep.',
  tag: 'therapy',
  date: '2026-10-08',
  createdAt: '2026-10-08T19:00:00.000Z',
  updatedAt: '2026-10-08T19:00:00.000Z',
};

function memoryStore(initial: Note[] = []) {
  const notes = new Map(initial.map((note) => [note.id, note]));
  const store: NotesStore = {
    list: async () => [...notes.values()].sort((a, b) => b.date.localeCompare(a.date)),
    save: async (note) => void notes.set(note.id, note),
    remove: async (id) => void notes.delete(id),
  };
  return { store, notes };
}

const clock = { now: () => new Date('2026-10-12T09:30:00'), newId: () => 'note-new' };

function renderBoard(initial: Note[] = []) {
  const memory = memoryStore(initial);
  renderWithProviders(<Noteboard store={memory.store} clock={clock} />, {
    translations: { noteboard: en },
  });
  return { notes: memory.notes, user: userEvent.setup() };
}

describe('RF-17 Noteboard list and editor', () => {
  it('shows the empty state with a new note action when there are no notes', async () => {
    renderBoard();
    expect(await screen.findByRole('heading', { name: en.empty.title })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: en.actions.new })).toHaveLength(2);
  });

  it('creates a note dated today with title, text and tag', async () => {
    const { notes, user } = renderBoard();
    await user.click((await screen.findAllByRole('button', { name: en.actions.new }))[0]!);
    await user.type(screen.getByRole('textbox', { name: en.editor.title }), 'Session');
    await user.type(screen.getByRole('textbox', { name: en.editor.body }), 'About sleep.');
    await user.type(screen.getByRole('textbox', { name: en.editor.tag }), 'therapy');
    await user.click(screen.getByRole('button', { name: en.actions.save }));

    expect(await screen.findByRole('button', { name: /Session/ })).toBeInTheDocument();
    expect(notes.get('note-new')).toMatchObject({
      kind: 'plain',
      title: 'Session',
      body: 'About sleep.',
      tag: 'therapy',
      date: '2026-10-12',
    });
  });

  it('keeps Save disabled until the note has a title or text', async () => {
    const { user } = renderBoard();
    await user.click((await screen.findAllByRole('button', { name: en.actions.new }))[0]!);
    expect(screen.getByRole('button', { name: en.actions.save })).toBeDisabled();
  });

  it('edits a saved note and keeps its date', async () => {
    const { notes, user } = renderBoard([savedNote]);
    await user.click(await screen.findByRole('button', { name: /Session/ }));
    const body = screen.getByRole('textbox', { name: en.editor.body });
    await user.clear(body);
    await user.type(body, 'We talked about training.');
    await user.click(screen.getByRole('button', { name: en.actions.save }));

    await waitFor(() =>
      expect(notes.get('note-1')).toMatchObject({
        body: 'We talked about training.',
        date: '2026-10-08',
      }),
    );
  });

  it('deletes a note only after confirmation', async () => {
    const { notes, user } = renderBoard([savedNote]);
    await user.click(await screen.findByRole('button', { name: /Session/ }));
    await user.click(screen.getByRole('button', { name: en.actions.delete }));
    await user.click(await screen.findByRole('button', { name: en.delete.cancel }));
    expect(notes.has('note-1')).toBe(true);

    await user.click(screen.getByRole('button', { name: en.actions.delete }));
    await user.click(await screen.findByRole('button', { name: en.delete.confirm }));
    expect(await screen.findByRole('heading', { name: en.empty.title })).toBeInTheDocument();
    expect(notes.has('note-1')).toBe(false);
  });

  it('shows the list or the editor, one column at a time (RF-29)', async () => {
    const { user } = renderBoard([savedNote]);
    await user.click(await screen.findByRole('button', { name: /Session/ }));
    expect(screen.queryByRole('region', { name: en.list.label })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: en.actions.back }));
    expect(screen.getByRole('region', { name: en.list.label })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: en.editor.label })).not.toBeInTheDocument();
  });
});
