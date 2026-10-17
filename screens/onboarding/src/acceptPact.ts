import { createSigningKeys } from '@vitapact/core/crypto';
import {
  createProfile,
  saveProfile,
  type Goals,
  type VitaPactDatabase,
} from '@vitapact/core/storage';

export interface PactChoices {
  nickname: string;
  goals: Goals;
  createdAt: string;
}

/** Creates the profile with its UUID, then the signing keys friends will recognise (RF-01, RF-02). */
export async function acceptPact(db: VitaPactDatabase, choices: PactChoices): Promise<void> {
  const profile = await createProfile(db, choices);
  if (profile.signingKeys) return;
  await saveProfile(db, { ...profile, signingKeys: await createSigningKeys() });
}
