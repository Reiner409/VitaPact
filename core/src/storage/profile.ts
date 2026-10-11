import type { VitaPactDatabase } from './database';
import { PROFILE_ID, type Profile } from './records';

export const getProfile = (db: VitaPactDatabase): Promise<Profile | undefined> =>
  db.profile.get(PROFILE_ID);

export async function saveProfile(db: VitaPactDatabase, profile: Profile): Promise<void> {
  await db.profile.put(profile);
}
