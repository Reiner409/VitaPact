import { IDBFactory } from 'fake-indexeddb';
import { beforeAll, describe, expect, it } from 'vitest';
import { base64UrlToBytes, textToBytes } from './encoding';
import {
  createNoteLock,
  deriveNoteKey,
  PBKDF2_ITERATIONS,
  protectNote,
  protectNotes,
  revealNote,
  revealNotes,
  unlockNoteKey,
  WrongNotePasswordError,
  type NoteLock,
  type PlainNote,
  type ProtectedNote,
} from './notes';

const password = 'correct horse battery staple';

const notes: PlainNote[] = [
  {
    id: 'n1',
    title: 'Session with the psychologist',
    body: 'We talked about sleep anxiety before exams.',
    date: '2026-10-08',
    tag: 'Psychologist',
    createdAt: '2026-10-08T18:00:00.000Z',
    updatedAt: '2026-10-08T18:30:00.000Z',
  },
  {
    id: 'n2',
    title: 'Climbing',
    body: 'Two hours at the gym, not counted by the app.',
    date: '2026-10-09',
    createdAt: '2026-10-09T20:00:00.000Z',
    updatedAt: '2026-10-09T20:00:00.000Z',
  },
];

const plainTexts = [
  ...notes.flatMap(({ title, body, tag }) => [title, body, tag ?? '']).filter(Boolean),
  password,
];

let lock: NoteLock;
let key: CryptoKey;

beforeAll(async () => {
  ({ lock, key } = await createNoteLock(password));
});

function readAllFromIndexedDb(records: ProtectedNote[]): Promise<unknown[]> {
  const request = new IDBFactory().open('vitapact-inspection', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('notes', { keyPath: 'id' });
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const transaction = request.result.transaction('notes', 'readwrite');
      const store = transaction.objectStore('notes');
      records.forEach((record) => store.put(record));
      const all = store.getAll();
      transaction.oncomplete = () => resolve(all.result);
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  });
}

describe('RF-18 RNF-03 note encryption', () => {
  it('RF-18 RNF-03 encrypts a note and decrypts it back to the same content', async () => {
    const [note] = notes;
    if (!note) throw new Error('missing fixture');

    const sealed = await protectNote(note, key);

    expect(await revealNote(sealed, key)).toEqual(note);
  });

  it('RF-18 keeps a note without a tag without a tag after the round trip', async () => {
    const untagged = notes[1];
    if (!untagged) throw new Error('missing fixture');

    const revealed = await revealNote(await protectNote(untagged, key), key);

    expect(revealed).toEqual(untagged);
    expect('tag' in revealed).toBe(false);
  });

  it('RNF-03 uses a different IV for every note, even with the same content', async () => {
    const [note] = notes;
    if (!note) throw new Error('missing fixture');

    const sealed = await protectNotes([note, note, ...notes], key);
    const ivs = new Set(sealed.map(({ iv }) => iv));

    expect(ivs.size).toBe(sealed.length);
    sealed.forEach(({ iv }) => expect(base64UrlToBytes(iv)).toHaveLength(12));
  });

  it('RF-18 RNF-03 leaves no plain text in the database after encryption', async () => {
    const stored = await readAllFromIndexedDb(await protectNotes(notes, key));
    const dump = JSON.stringify(stored);

    expect(stored).toHaveLength(notes.length);
    plainTexts.forEach((text) => expect(dump).not.toContain(text));
  });

  it('RF-18 removing the password puts the notes back in plain text', async () => {
    const sealed = await protectNotes(notes, key);

    expect(await revealNotes(sealed, key)).toEqual(notes);
  });
});

describe('RF-18 RNF-03 RNF-04 note password', () => {
  it('RF-18 RNF-04 rejects a wrong password, so the notes cannot be read without it', async () => {
    await expect(unlockNoteKey('wrong password', lock)).rejects.toThrow(WrongNotePasswordError);
  });

  it('RF-18 unlocks with the right password and reads notes sealed in an earlier session', async () => {
    const sealed = await protectNotes(notes, key);

    const unlocked = await unlockNoteKey(password, lock);

    expect(await revealNotes(sealed, unlocked)).toEqual(notes);
  });

  it('RF-18 RNF-04 refuses to decrypt notes with a key from another password', async () => {
    const sealed = await protectNotes(notes, key);
    const { key: otherKey } = await createNoteLock('another password');

    await expect(revealNotes(sealed, otherKey)).rejects.toThrow(WrongNotePasswordError);
  });

  it('RF-18 refuses a note whose ciphertext was altered', async () => {
    const [note] = notes;
    if (!note) throw new Error('missing fixture');
    const sealed = await protectNote(note, key);
    const flipped = sealed.ciphertext.startsWith('A') ? 'B' : 'A';
    const altered = { ...sealed, ciphertext: `${flipped}${sealed.ciphertext.slice(1)}` };

    await expect(revealNote(altered, key)).rejects.toThrow(WrongNotePasswordError);
  });

  it('RNF-03 derives an AES-GCM 256 key with PBKDF2 SHA-256 and 310,000 iterations', async () => {
    const [note] = notes;
    if (!note) throw new Error('missing fixture');
    const salt = base64UrlToBytes(lock.salt);
    const expectedKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 310_000 },
      await crypto.subtle.importKey('raw', textToBytes(password), 'PBKDF2', false, ['deriveKey']),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    const sealed = await protectNote(note, await deriveNoteKey(password, salt));

    expect(PBKDF2_ITERATIONS).toBe(310_000);
    expect(await revealNote(sealed, expectedKey)).toEqual(note);
  });

  it('RNF-03 uses a new random salt every time a password is set', async () => {
    const again = await createNoteLock(password);

    expect(again.lock.salt).not.toBe(lock.salt);
    expect(base64UrlToBytes(lock.salt)).toHaveLength(16);
  });

  it('RF-18 RNF-03 keeps the key in memory only: not exportable, and no password in the lock', async () => {
    expect(key.extractable).toBe(false);
    await expect(crypto.subtle.exportKey('raw', key)).rejects.toThrow();
    expect(JSON.stringify(lock)).not.toContain(password);
    expect(Object.keys(lock).sort()).toEqual(['check', 'salt']);
  });
});
