import type { PlainNote } from '@vitapact/core/storage/notes';

/** Newest day first; notes of the same day by the moment they were written, newest first. */
export function newestFirst(notes: readonly PlainNote[]): PlainNote[] {
  return [...notes].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}
