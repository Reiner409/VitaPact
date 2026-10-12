import { toCalendarDate } from '@vitapact/core/calendar';
import type { PlainNote } from '@vitapact/core/storage/notes';
import { useState } from 'react';
import { createNote, updateNote, type NoteDraft } from './noteDraft';
import type { NotesStore } from './notesStore';
import { useNotes } from './useNotes';

export type NoteboardView = { kind: 'list' } | { kind: 'new' } | { kind: 'edit'; note: PlainNote };

export interface NoteboardClock {
  /** Injected so tests fix the date of a new note (G7.4). */
  now: () => Date;
  newId: () => string;
}

const LIST: NoteboardView = { kind: 'list' };

/** Which note is open, and the actions that save, delete or leave it. */
export function useNoteboard(store: NotesStore, { now, newId }: NoteboardClock) {
  const { notes, save, remove } = useNotes(store);
  const [view, setView] = useState<NoteboardView>(LIST);

  const noteFrom = (draft: NoteDraft, moment: Date) =>
    view.kind === 'edit'
      ? updateNote(view.note, draft, moment.toISOString())
      : createNote(draft, {
          id: newId(),
          date: toCalendarDate(moment),
          now: moment.toISOString(),
        });

  return {
    notes,
    view,
    create: () => setView({ kind: 'new' }),
    open: (note: PlainNote) => setView({ kind: 'edit', note }),
    close: () => setView(LIST),
    saveDraft: async (draft: NoteDraft) => {
      await save(noteFrom(draft, now()));
      setView(LIST);
    },
    removeOpen: async () => {
      if (view.kind === 'edit') await remove(view.note.id);
      setView(LIST);
    },
  };
}
