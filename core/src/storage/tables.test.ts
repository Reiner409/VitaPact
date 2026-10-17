import { describe, expect, it } from 'vitest';
import { pillarRegistry } from '../pillars';
import { getDailyEntry, listDailyEntries, saveDailyEntry } from './daily-entries';
import {
  getFriend,
  getFriendReport,
  listFriendReports,
  listFriendReportsOf,
  listFriendReportsOfWeek,
  listFriends,
  saveFriend,
  saveFriendReport,
} from './friends';
import { deleteGroup, getGroup, listGroups, saveGroup } from './groups';
import { getProfile, saveProfile } from './profile';
import {
  openTestDatabase,
  sampleEntry,
  sampleFriend,
  sampleGroup,
  sampleProfile,
  sampleReport,
  sampleWeighIn,
} from './testing';
import { getWeighIn, listWeighIns, saveWeighIn } from './weigh-ins';

describe('RNF-11 profile table', () => {
  it('has no profile before the first launch', async () => {
    const db = await openTestDatabase();

    expect(await getProfile(db)).toBeUndefined();
  });

  it('reads back the saved profile', async () => {
    const db = await openTestDatabase();

    await saveProfile(db, sampleProfile);

    expect(await getProfile(db)).toEqual(sampleProfile);
  });
});

describe('RNF-11 dailyEntries table', () => {
  it('reads back a saved day', async () => {
    const db = await openTestDatabase();

    await saveDailyEntry(db, sampleEntry);

    expect(await getDailyEntry(db, sampleEntry.date)).toEqual(sampleEntry);
  });

  it('keeps one entry per day, overwritten on a new save', async () => {
    const db = await openTestDatabase();
    const corrected = {
      ...sampleEntry,
      pillars: { sleep: { hours: 8, quality: 5 } },
      updatedAt: '2026-10-07T08:00:00.000Z',
    };

    await saveDailyEntry(db, sampleEntry);
    await saveDailyEntry(db, corrected);

    expect(await db.dailyEntries.count()).toBe(1);
    expect(await getDailyEntry(db, sampleEntry.date)).toEqual(corrected);
  });

  it('RF-23 saves the day values per pillar, so a new pillar is just another key', async () => {
    const db = await openTestDatabase();
    const withHydration = {
      ...sampleEntry,
      pillars: { ...sampleEntry.pillars, hydration: { litres: 2 } },
    };

    await saveDailyEntry(db, withHydration);

    const saved = await getDailyEntry(db, sampleEntry.date);
    expect(saved?.pillars['hydration']).toEqual({ litres: 2 });
    expect(saved?.pillars['sleep']).toEqual({ hours: 7.5, quality: 4 });
  });

  it('lists the days of a period, both ends included, oldest first', async () => {
    const db = await openTestDatabase();
    for (const date of ['2026-10-12', '2026-10-05', '2026-10-11', '2026-10-04']) {
      await saveDailyEntry(db, { ...sampleEntry, date });
    }

    const week = await listDailyEntries(db, '2026-10-05', '2026-10-11');

    expect(week.map(({ date }) => date)).toEqual(['2026-10-05', '2026-10-11']);
  });

  it('RNF-06 saves a check-in in under 100 ms', async () => {
    const db = await openTestDatabase();

    const started = performance.now();
    await saveDailyEntry(db, sampleEntry);

    expect(performance.now() - started).toBeLessThan(100);
  });
});

describe('RNF-11 weighIns table', () => {
  it('reads back the weigh-in of a week', async () => {
    const db = await openTestDatabase();

    await saveWeighIn(db, sampleWeighIn);

    expect(await getWeighIn(db, '2026-W41')).toEqual(sampleWeighIn);
    expect(await getWeighIn(db, '2026-W40')).toBeUndefined();
  });

  it('ties the weigh-in to its week even when measured on a later day', async () => {
    const db = await openTestDatabase();
    const caughtUp = { ...sampleWeighIn, measuredOn: '2026-10-13' };

    await saveWeighIn(db, caughtUp);

    expect(await getWeighIn(db, '2026-W41')).toEqual(caughtUp);
  });

  it('lists the weigh-ins oldest week first', async () => {
    const db = await openTestDatabase();
    await saveWeighIn(db, sampleWeighIn);
    await saveWeighIn(db, { ...sampleWeighIn, week: '2026-W40', weightKg: 79 });

    const weeks = (await listWeighIns(db)).map(({ week }) => week);

    expect(weeks).toEqual(['2026-W40', '2026-W41']);
  });
});

describe('RNF-11 groups table', () => {
  it('reads back, lists and deletes groups', async () => {
    const db = await openTestDatabase();
    const second = { ...sampleGroup, id: 'group-2', name: 'Family' };

    await saveGroup(db, sampleGroup);
    await saveGroup(db, second);
    await deleteGroup(db, second.id);

    expect(await getGroup(db, sampleGroup.id)).toEqual(sampleGroup);
    expect(await listGroups(db)).toEqual([sampleGroup]);
  });
});

describe('RNF-11 friends table', () => {
  it('reads back and lists friends', async () => {
    const db = await openTestDatabase();

    await saveFriend(db, sampleFriend);

    expect(await getFriend(db, sampleFriend.userId)).toEqual(sampleFriend);
    expect(await listFriends(db)).toEqual([sampleFriend]);
  });
});

describe('RNF-11 friendReports table', () => {
  it('replaces a report with the same UUID and week', async () => {
    const db = await openTestDatabase();
    const resent = {
      ...sampleReport,
      summary: { ...sampleReport.summary, score: 70 },
      importedAt: '2026-10-12T07:00:00.000Z',
    };

    await saveFriendReport(db, sampleFriend, sampleReport);
    await saveFriendReport(db, sampleFriend, resent);

    expect(await db.friendReports.count()).toBe(1);
    expect(await getFriendReport(db, sampleReport.userId, sampleReport.week)).toEqual(resent);
  });

  it('keeps reports of different weeks and lists them by week or by friend', async () => {
    const db = await openTestDatabase();
    const earlier = { ...sampleReport, week: '2026-W40' };
    const otherFriend = { ...sampleReport, userId: 'another-friend' };

    await saveFriendReport(db, sampleFriend, sampleReport);
    await saveFriendReport(db, sampleFriend, earlier);
    await saveFriendReport(db, { ...sampleFriend, userId: 'another-friend' }, otherFriend);

    expect(await listFriendReportsOfWeek(db, '2026-W41')).toHaveLength(2);
    const weeks = (await listFriendReportsOf(db, sampleFriend.userId)).map(({ week }) => week);
    expect(weeks).toEqual(['2026-W40', '2026-W41']);
    expect(await listFriendReports(db)).toHaveLength(3);
  });
});

describe('A1 the sample day used by screen tests', () => {
  it('RF-03 is a valid day for the pillar registry', () => {
    // Storage allows null for a cleared field; the registry reads a missing one as undefined.
    const day = Object.fromEntries(
      Object.entries(sampleEntry.pillars).map(([pillar, values]) => [
        pillar,
        Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value ?? undefined])),
      ]),
    );
    expect(pillarRegistry.validateDay(day)).toEqual([]);
  });
});
