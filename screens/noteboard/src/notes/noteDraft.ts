import type { IsoDate, Timestamp } from '@vitapact/core/storage';
import type { PlainNote } from '@vitapact/core/storage/notes';

/** Bounds on what one note may hold, so a note never grows without limit (G9.7). */
export const NOTE_LIMITS = { title: 120, body: 20_000, tag: 40 } as const;

/** What the editor holds while the user types. */
export interface NoteDraft {
  title: string;
  body: string;
  tag: string;
}

export const emptyDraft: NoteDraft = { title: '', body: '', tag: '' };

export interface NewNoteContext {
  id: string;
  date: IsoDate;
  now: Timestamp;
}

export const draftOf = ({ title, body, tag }: PlainNote): NoteDraft => ({ title, body, tag });

/** A note needs at least a title or some text to be worth saving. */
export const canSave = (draft: NoteDraft) => draft.title.trim() !== '' || draft.body.trim() !== '';

const tidy = ({ title, body, tag }: NoteDraft): NoteDraft => ({
  title: title.trim().slice(0, NOTE_LIMITS.title),
  body: body.slice(0, NOTE_LIMITS.body),
  tag: tag.trim().slice(0, NOTE_LIMITS.tag),
});

export function createNote(draft: NoteDraft, { id, date, now }: NewNoteContext): PlainNote {
  return { id, kind: 'plain', date, createdAt: now, updatedAt: now, ...tidy(draft) };
}

export function updateNote(note: PlainNote, draft: NoteDraft, now: Timestamp): PlainNote {
  return { ...note, ...tidy(draft), updatedAt: now };
}
