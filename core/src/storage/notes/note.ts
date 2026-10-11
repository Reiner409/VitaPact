import type { IsoDate, Timestamp } from '../records';

interface NoteBase {
  id: string;
  date: IsoDate;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PlainNote extends NoteBase {
  kind: 'plain';
  title: string;
  body: string;
  tag: string;
}

/** A note behind the Noteboard password: title, body and tag live only inside the ciphertext. */
export interface ProtectedNote extends NoteBase {
  kind: 'protected';
  ciphertext: string;
  iv: string;
}

export type Note = PlainNote | ProtectedNote;
