import { base64UrlToBytes, bytesToBase64Url, textToBytes } from './encoding';

export const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const NOTE_KEY_ALGORITHM: AesKeyGenParams = { name: 'AES-GCM', length: 256 };
const LOCK_CHECK_TEXT = 'vitapact-notes';

interface NoteContent {
  title: string;
  body: string;
  tag?: string;
}

interface NoteMetadata {
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type PlainNote = NoteMetadata & NoteContent;

export interface SealedText {
  ciphertext: string;
  iv: string;
}

/** Title, body and tag are sealed together; only what is needed to list and sort stays readable. */
export type ProtectedNote = NoteMetadata & SealedText;

/** Saved next to the notes: a random salt and a sealed marker that tells a wrong password apart. */
export interface NoteLock {
  salt: string;
  check: SealedText;
}

export class WrongNotePasswordError extends Error {
  constructor() {
    super('The notes password is wrong or the note was altered');
    this.name = 'WrongNotePasswordError';
  }
}

/** The key is non-extractable, so it lives only in memory and nothing can write it to disk. */
export async function deriveNoteKey(password: string, salt: Uint8Array<ArrayBuffer>) {
  const passwordKey = await crypto.subtle.importKey('raw', textToBytes(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    passwordKey,
    NOTE_KEY_ALGORITHM,
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function createNoteLock(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveNoteKey(password, salt);
  const lock: NoteLock = {
    salt: bytesToBase64Url(salt),
    check: await sealText(key, LOCK_CHECK_TEXT),
  };
  return { lock, key };
}

export async function unlockNoteKey(password: string, lock: NoteLock): Promise<CryptoKey> {
  const key = await deriveNoteKey(password, base64UrlToBytes(lock.salt));
  await openText(key, lock.check);
  return key;
}

async function sealText(key: CryptoKey, text: string): Promise<SealedText> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textToBytes(text));
  return { ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)), iv: bytesToBase64Url(iv) };
}

/** AES-GCM authenticates the data, so a wrong key and a tampered note fail the same way. */
async function openText(key: CryptoKey, sealed: SealedText): Promise<string> {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64UrlToBytes(sealed.iv) },
      key,
      base64UrlToBytes(sealed.ciphertext),
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw new WrongNotePasswordError();
  }
}

export async function protectNote(note: PlainNote, key: CryptoKey): Promise<ProtectedNote> {
  const { title, body, tag, ...metadata } = note;
  const content: NoteContent = tag === undefined ? { title, body } : { title, body, tag };
  return { ...metadata, ...(await sealText(key, JSON.stringify(content))) };
}

export async function revealNote(note: ProtectedNote, key: CryptoKey): Promise<PlainNote> {
  const { ciphertext, iv, ...metadata } = note;
  const content = JSON.parse(await openText(key, { ciphertext, iv })) as NoteContent;
  return { ...metadata, ...content };
}

export function protectNotes(notes: PlainNote[], key: CryptoKey): Promise<ProtectedNote[]> {
  return Promise.all(notes.map((note) => protectNote(note, key)));
}

export function revealNotes(notes: ProtectedNote[], key: CryptoKey): Promise<PlainNote[]> {
  return Promise.all(notes.map((note) => revealNote(note, key)));
}
