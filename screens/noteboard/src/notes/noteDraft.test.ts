import type { PlainNote } from '@vitapact/core/storage/notes';
import { describe, expect, it } from 'vitest';
import { NOTE_LIMITS, canSave, createNote, draftOf, emptyDraft, updateNote } from './noteDraft';

const context = { id: 'note-1', date: '2026-10-08', now: '2026-10-08T19:00:00.000Z' };

describe('RF-17 note title, text, date and tag', () => {
  it('creates a plain note dated the day it was written', () => {
    const note = createNote({ title: 'Session', body: 'Sleep.', tag: 'therapy' }, context);
    expect(note).toEqual<PlainNote>({
      id: 'note-1',
      kind: 'plain',
      title: 'Session',
      body: 'Sleep.',
      tag: 'therapy',
      date: '2026-10-08',
      createdAt: context.now,
      updatedAt: context.now,
    });
  });

  it('trims the title and tag but keeps the text as typed', () => {
    const note = createNote({ title: '  Session ', body: '  indented\n', tag: ' gym ' }, context);
    expect(note).toMatchObject({ title: 'Session', body: '  indented\n', tag: 'gym' });
  });

  it('cuts every field to its limit', () => {
    const long = (length: number) => 'x'.repeat(length + 5);
    const note = createNote(
      { title: long(NOTE_LIMITS.title), body: long(NOTE_LIMITS.body), tag: long(NOTE_LIMITS.tag) },
      context,
    );
    expect(note.title).toHaveLength(NOTE_LIMITS.title);
    expect(note.body).toHaveLength(NOTE_LIMITS.body);
    expect(note.tag).toHaveLength(NOTE_LIMITS.tag);
  });

  it('keeps the id, date and creation time on edit and moves the update time', () => {
    const note = createNote({ title: 'Session', body: '', tag: '' }, context);
    const later = '2026-10-09T08:00:00.000Z';
    const edited = updateNote(note, { ...draftOf(note), body: 'More.' }, later);
    expect(edited).toEqual({ ...note, body: 'More.', updatedAt: later });
  });

  it('saves only a note with a title or some text', () => {
    expect(canSave(emptyDraft)).toBe(false);
    expect(canSave({ title: ' ', body: '\n', tag: 'gym' })).toBe(false);
    expect(canSave({ ...emptyDraft, body: 'Text only' })).toBe(true);
  });
});
