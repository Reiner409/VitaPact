import type { VitaPactDatabase } from '@vitapact/core/storage';
import {
  hasNotesPassword,
  removeNotesPassword,
  setNotesPassword,
  unlockNotes,
  WrongNotePasswordError,
} from '@vitapact/core/storage/notes';
import { useEffect, useState } from 'react';

/** Loading, no password, locked, or unlocked with the key held only in memory (RF-18). */
export type NotesLock =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'locked' }
  | { status: 'unlocked'; key: CryptoKey };

/** True when the password was right; any other failure is thrown. */
async function rightPassword(attempt: () => Promise<void>): Promise<boolean> {
  try {
    await attempt();
    return true;
  } catch (error) {
    if (error instanceof WrongNotePasswordError) return false;
    throw error;
  }
}

/** F3-NB-04..06: set, unlock, lock and remove the Noteboard password. */
export function useNotesLock(db: VitaPactDatabase) {
  const [lock, setLock] = useState<NotesLock>({ status: 'loading' });

  useEffect(() => {
    let current = true;
    void hasNotesPassword(db).then(
      (locked) => current && setLock({ status: locked ? 'locked' : 'none' }),
    );
    return () => {
      current = false;
    };
  }, [db]);

  return {
    lock,
    setPassword: async (password: string) =>
      setLock({ status: 'unlocked', key: await setNotesPassword(db, password) }),
    unlock: (password: string) =>
      rightPassword(async () =>
        setLock({ status: 'unlocked', key: await unlockNotes(db, password) }),
      ),
    lockNow: () => setLock({ status: 'locked' }),
    removePassword: (password: string) =>
      rightPassword(async () => {
        await removeNotesPassword(db, password);
        setLock({ status: 'none' });
      }),
  };
}
