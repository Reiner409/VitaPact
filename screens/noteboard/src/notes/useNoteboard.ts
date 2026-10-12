import { toCalendarDate } from '@vitapact/core/calendar';
import type { IsoDate } from '@vitapact/core/storage';
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

/** The storage call that failed, so the screen can say which one. */
export type NoteboardFailure = 'save' | 'delete';

const LIST: NoteboardView = { kind: 'list' };

/** Which note is open, and the actions that save, delete or leave it. */
export function useNoteboard(store: NotesStore, { now, newId }: NoteboardClock) {
  const { notes, save, remove } = useNotes(store);
  const [view, setView] = useState<NoteboardView>(LIST);
  const [failure, setFailure] = useState<NoteboardFailure | undefined>(undefined);

  const backToListUnlessFails = async (kind: NoteboardFailure, change: () => Promise<void>) => {
    try {
      await change();
      setView(LIST);
    } catch {
      setFailure(kind);
    }
  };
  const noteFrom = (draft: NoteDraft, moment: Date) =>
    view.kind === 'edit'
      ? updateNote(view.note, draft, moment.toISOString())
      : createNote(draft, { id: newId(), date: toCalendarDate(moment), now: moment.toISOString() });

  return {
    notes,
    view,
    failure,
    openDate: (): IsoDate => (view.kind === 'edit' ? view.note.date : toCalendarDate(now())),
    create: () => setView({ kind: 'new' }),
    open: (note: PlainNote) => setView({ kind: 'edit', note }),
    close: () => setView(LIST),
    dismissFailure: () => setFailure(undefined),
    saveDraft: (draft: NoteDraft) =>
      backToListUnlessFails('save', () => save(noteFrom(draft, now()))),
    removeOpen: () =>
      backToListUnlessFails('delete', async () => {
        if (view.kind === 'edit') await remove(view.note.id);
      }),
  };
}
