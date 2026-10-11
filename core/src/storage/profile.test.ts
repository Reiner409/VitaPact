import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { createProfile, DEFAULT_GOALS, getProfile, saveProfile } from './profile';
import { openTestDatabase } from './testing';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const firstLaunch = { nickname: 'Rei', createdAt: '2026-10-05T08:00:00.000Z' };

describe('RF-01 profile creation', () => {
  it('starts with 7.5 hours of sleep, 3 workouts a week and 20 minutes of sun', async () => {
    const db = await openTestDatabase();

    const profile = await createProfile(db, firstLaunch);

    expect(DEFAULT_GOALS).toEqual({ sleepHours: 7.5, workoutsPerWeek: 3, sunMinutes: 20 });
    expect(profile.goals).toEqual(DEFAULT_GOALS);
    expect(profile.hideWeight).toBe(false);
    expect(profile.nickname).toBe('Rei');
    expect(await getProfile(db)).toEqual(profile);
  });

  it('keeps the goals and weight choice picked on first launch', async () => {
    const db = await openTestDatabase();
    const goals = { sleepHours: 8, workoutsPerWeek: 4, sunMinutes: 30 };

    const profile = await createProfile(db, { ...firstLaunch, goals, hideWeight: true });

    expect(profile.goals).toEqual(goals);
    expect(profile.hideWeight).toBe(true);
  });

  it('stores only the known goal fields', async () => {
    const db = await openTestDatabase();
    const goals = { sleepHours: 8, workoutsPerWeek: 4, sunMinutes: 30, extra: 'ignored' };

    await createProfile(db, { ...firstLaunch, goals });

    expect((await getProfile(db))?.goals).toEqual({
      sleepHours: 8,
      workoutsPerWeek: 4,
      sunMinutes: 30,
    });
  });
});

describe('RF-02 user identity', () => {
  it('generates a valid UUID v4 on first launch', async () => {
    const db = await openTestDatabase();

    const { userId } = await createProfile(db, firstLaunch);

    expect(userId).toMatch(UUID_V4);
  });

  it('gives each new profile its own UUID', async () => {
    const first = await createProfile(await openTestDatabase(), firstLaunch);
    const second = await createProfile(await openTestDatabase(), firstLaunch);

    expect(first.userId).not.toBe(second.userId);
  });

  it('keeps the UUID when the profile is saved a second time', async () => {
    const db = await openTestDatabase();
    const created = await createProfile(db, firstLaunch);

    await saveProfile(db, {
      ...created,
      nickname: 'Rei the Second',
      userId: '00000000-0000-4000-8000-000000000000',
      createdAt: '2027-01-01T00:00:00.000Z',
    });

    const saved = await getProfile(db);
    expect(saved?.nickname).toBe('Rei the Second');
    expect(saved?.userId).toBe(created.userId);
    expect(saved?.createdAt).toBe(created.createdAt);
  });

  it('keeps the same UUID after the app is reopened', async () => {
    const factory = new IDBFactory();
    const db = await openTestDatabase(undefined, factory);
    const created = await createProfile(db, firstLaunch);
    db.close();

    const reopened = await openTestDatabase(undefined, factory);
    const again = await createProfile(reopened, { ...firstLaunch, nickname: 'Someone else' });

    expect(again.userId).toBe(created.userId);
    expect(again.createdAt).toBe(created.createdAt);
    expect(await getProfile(reopened)).toEqual(created);
  });

  it('keeps the signing keys when a profile read before they existed is saved', async () => {
    const db = await openTestDatabase();
    const readEarlier = await createProfile(db, firstLaunch);
    const signingKeys = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign', 'verify'],
    );
    await saveProfile(db, { ...readEarlier, signingKeys });

    await saveProfile(db, { ...readEarlier, nickname: 'Rei the Second' });

    const saved = await getProfile(db);
    expect(saved?.nickname).toBe('Rei the Second');
    expect(saved?.signingKeys).toEqual(signingKeys);
  });

  it('never replaces an existing identity when creation runs again', async () => {
    const db = await openTestDatabase();
    const created = await createProfile(db, firstLaunch);

    const again = await createProfile(db, { ...firstLaunch, nickname: 'Someone else' });

    expect(again).toEqual(created);
    expect(await getProfile(db)).toEqual(created);
  });
});
