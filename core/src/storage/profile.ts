import type { VitaPactDatabase } from './database';
import { PROFILE_ID, type Goals, type Profile, type Timestamp } from './records';

export const DEFAULT_GOALS: Readonly<Goals> = {
  sleepHours: 7.5,
  workoutsPerWeek: 3,
  sunMinutes: 20,
};

export interface FirstLaunchChoices {
  nickname: string;
  createdAt: Timestamp;
  goals?: Goals;
  hideWeight?: boolean;
}

const copyGoals = ({ sleepHours, workoutsPerWeek, sunMinutes }: Goals): Goals => ({
  sleepHours,
  workoutsPerWeek,
  sunMinutes,
});

export const getProfile = (db: VitaPactDatabase): Promise<Profile | undefined> =>
  db.profile.get(PROFILE_ID);

/** An existing profile is returned unchanged, so the identity friends know is never replaced (RF-02). */
export function createProfile(db: VitaPactDatabase, choices: FirstLaunchChoices): Promise<Profile> {
  return db.transaction('rw', db.profile, async () => {
    const existing = await getProfile(db);
    if (existing) return existing;
    const profile: Profile = {
      id: PROFILE_ID,
      userId: crypto.randomUUID(),
      nickname: choices.nickname,
      goals: copyGoals(choices.goals ?? DEFAULT_GOALS),
      theme: 'light',
      hideWeight: choices.hideWeight ?? false,
      createdAt: choices.createdAt,
    };
    await db.profile.put(profile);
    return profile;
  });
}

/**
 * Friends recognise the UUID and the signing keys, so a save keeps the stored ones: settings may
 * hold a profile read before the keys were created (RF-02).
 */
const withoutNoteLock = ({ noteLock: _noteLock, ...profile }: Profile): Profile => profile;

export async function saveProfile(db: VitaPactDatabase, profile: Profile): Promise<void> {
  const incoming = withoutNoteLock(profile);
  await db.transaction('rw', db.profile, async () => {
    const existing = await getProfile(db);
    await db.profile.put({ ...incoming, ...(existing && identityOf(existing, profile)) });
  });
}

function identityOf(existing: Profile, incoming: Profile) {
  const signingKeys = incoming.signingKeys ?? existing.signingKeys;
  // The Noteboard password is set and removed only through the notes lock, never by a profile save.
  const { noteLock } = existing;
  return {
    userId: existing.userId,
    createdAt: existing.createdAt,
    ...(signingKeys && { signingKeys }),
    ...(noteLock && { noteLock }),
  };
}
