import type { IsoDate } from '@vitapact/core/storage';

/** The note's calendar day in the reader's language; read as UTC so no time zone shifts it. */
export function formatNoteDate(date: IsoDate, language: string): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
