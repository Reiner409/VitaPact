import type { Note } from '@vitapact/core/storage/notes';
import { screen, waitFor, within } from '@testing-library/react';
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

  it('names each card with its title and date', async () => {
    renderBoard([savedNote]);
    expect(
      await screen.findByRole('button', { name: 'Session · Oct 8, 2026 therapy' }),
    ).toBeInTheDocument();
  });

  it('shows the date of the open note under the title', async () => {
    const { user } = renderBoard([savedNote]);
    await user.click(await screen.findByRole('button', { name: /Session/ }));
    expect(screen.getByText('Oct 8, 2026')).toBeInTheDocument();
  });

  it('keeps the editor open and says so when the note cannot be saved', async () => {
    const memory = memoryStore();
    const failing: NotesStore = { ...memory.store, save: () => Promise.reject(new Error('full')) };
    renderWithProviders(<Noteboard store={failing} clock={clock} />, {
      translations: { noteboard: en },
    });
    const user = userEvent.setup();
    await user.click((await screen.findAllByRole('button', { name: en.actions.new }))[0]!);
    await user.type(screen.getByRole('textbox', { name: en.editor.title }), 'Session');
    await user.click(screen.getByRole('button', { name: en.actions.save }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.errors.save);
    expect(screen.getByRole('textbox', { name: en.editor.title })).toHaveValue('Session');
  });
});

const walkNote: Note = {
  ...savedNote,
  id: 'note-2',
  title: 'Long walk',
  body: 'Two hours by the river.',
  tag: 'Activity',
  date: '2026-10-10',
};

describe('RF-17 Noteboard search and tags', () => {
  it('narrows the list as the user types, and says when nothing matches', async () => {
    const { user } = renderBoard([savedNote, walkNote]);
    const search = await screen.findByRole('textbox', { name: en.search.label });
    await user.type(search, 'RIVER');
    expect(screen.getByRole('button', { name: /Long walk/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Session/ })).not.toBeInTheDocument();

    await user.type(search, ' nowhere');
    expect(screen.getByRole('heading', { name: en.noMatch.title })).toBeInTheDocument();
  });

  it('filters the list by one of the tags in use', async () => {
    const { user } = renderBoard([savedNote, walkNote]);
    const filter = await screen.findByRole('radiogroup', { name: en.filter.label });
    await user.click(within(filter).getByRole('radio', { name: 'Activity' }));
    expect(screen.queryByRole('button', { name: /Session/ })).not.toBeInTheDocument();

    await user.click(within(filter).getByRole('radio', { name: en.filter.all }));
    expect(screen.getByRole('button', { name: /Session/ })).toBeInTheDocument();
  });

  it('drops the tag filter once no note has that tag any more', async () => {
    const { user } = renderBoard([savedNote, walkNote]);
    const filter = await screen.findByRole('radiogroup', { name: en.filter.label });
    await user.click(within(filter).getByRole('radio', { name: 'Activity' }));
    await user.click(screen.getByRole('button', { name: /Long walk/ }));
    await user.click(screen.getByRole('button', { name: en.actions.delete }));
    await user.click(await screen.findByRole('button', { name: en.delete.confirm }));

    expect(await screen.findByRole('button', { name: /Session/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: en.filter.all })).toBeChecked();
  });

  it('keeps the search when the user opens a note and comes back', async () => {
    const { user } = renderBoard([savedNote, walkNote]);
    await user.type(await screen.findByRole('textbox', { name: en.search.label }), 'walk');
    await user.click(screen.getByRole('button', { name: /Long walk/ }));
    await user.click(screen.getByRole('button', { name: en.actions.back }));
    expect(screen.getByRole('textbox', { name: en.search.label })).toHaveValue('walk');
    expect(screen.queryByRole('button', { name: /Session/ })).not.toBeInTheDocument();
  });

  it('suggests the tags already used and puts the chosen one in the tag field (D32)', async () => {
    const { notes, user } = renderBoard([savedNote, walkNote]);
    await user.click((await screen.findAllByRole('button', { name: en.actions.new }))[0]!);
    await user.type(screen.getByRole('textbox', { name: en.editor.title }), 'Run');
    const suggestions = screen.getByRole('radiogroup', { name: en.editor.suggestions });
    await user.click(within(suggestions).getByRole('radio', { name: 'Activity' }));
    expect(screen.getByRole('textbox', { name: en.editor.tag })).toHaveValue('Activity');
    await user.click(screen.getByRole('button', { name: en.actions.save }));
    await waitFor(() => expect(notes.get('note-new')).toMatchObject({ tag: 'Activity' }));
  });
});

describe('RNF-02 Noteboard privacy banner', () => {
  it('says the notes are never shared, on the list and in the editor', async () => {
    const { user } = renderBoard([savedNote]);
    expect(await screen.findByText(en.privacy)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Session/ }));
    expect(screen.getByText(en.privacy)).toBeInTheDocument();
  });
});
