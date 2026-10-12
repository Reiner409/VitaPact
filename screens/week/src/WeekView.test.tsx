import { pillarRegistry } from '@vitapact/core/pillars';
import { VERDICT_BANDS } from '@vitapact/core/scoring';
import { saveDailyEntry, saveProfile, saveWeighIn } from '@vitapact/core/storage';
import type { DailyEntry, VitaPactDatabase } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@vitapact/ui/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import en from '../locales/en/week.json';
import { PILLARS_WITH_TEXT } from './WeekPillars';
import { WeekView } from './WeekView';

const content = {
  verdict: Object.fromEntries(VERDICT_BANDS.map((band) => [band, { title: `verdict ${band}` }])),
};

const goodDay = (date: string): DailyEntry => ({
  date,
  pillars: {
    sleep: { hours: 8, quality: 4 },
    training: { trained: true, type: 'gym', minutes: 45 },
    food: { rating: 5 },
    sun: { minutes: 30 },
  },
  updatedAt: `${date}T21:00:00.000Z`,
});

const WEEK_41_DAYS = ['05', '06', '07', '08', '09', '10', '11'].map((day) => `2026-10-${day}`);

let db: VitaPactDatabase;

beforeEach(async () => {
  db = await openTestDatabase();
});

function renderWeek(today: string) {
  renderWithProviders(<WeekView db={db} today={today} />, { translations: { week: en, content } });
}

describe('RF-08 week selector (F3-WK-01)', () => {
  it('opens on the current week with forward disabled', async () => {
    renderWeek('2026-10-12');
    expect(await screen.findByText('Week 42 · Oct 12 – Oct 18, 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: en.selector.next })).toBeDisabled();
  });

  it('goes back a week and forward again, never past the current week', async () => {
    const user = userEvent.setup();
    renderWeek('2026-10-12');
    await user.click(screen.getByRole('button', { name: en.selector.previous }));
    expect(await screen.findByText('Week 41 · Oct 5 – Oct 11, 2026')).toBeInTheDocument();
    const next = screen.getByRole('button', { name: en.selector.next });
    expect(next).toBeEnabled();
    await user.click(next);
    expect(await screen.findByText('Week 42 · Oct 12 – Oct 18, 2026')).toBeInTheDocument();
    expect(next).toBeDisabled();
  });

  it('goes back across the turn of the year into week 53', async () => {
    const user = userEvent.setup();
    renderWeek('2027-01-06');
    await user.click(screen.getByRole('button', { name: en.selector.previous }));
    expect(await screen.findByText('Week 53 · Dec 28 – Jan 3, 2027')).toBeInTheDocument();
  });
});

describe('RF-09 week score and verdict (F3-WK-02)', () => {
  it('shows a perfect week with its weigh-in as 100 in the top band', async () => {
    await Promise.all(WEEK_41_DAYS.map((date) => saveDailyEntry(db, goodDay(date))));
    await saveWeighIn(db, {
      week: '2026-W41',
      weightKg: 78.4,
      measuredOn: '2026-10-11',
      fastingConfirmed: true,
    });
    renderWeek('2026-10-11');
    const ring = await screen.findByRole('meter', { name: en.score.label });
    expect(ring).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('verdict greatShape')).toBeInTheDocument();
  });

  it('shows a week with nothing logged as 0 in the lowest band', async () => {
    renderWeek('2026-10-12');
    const ring = await screen.findByRole('meter', { name: en.score.label });
    expect(ring).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('verdict pauseWeek')).toBeInTheDocument();
  });

  it('scores against the goals of the saved profile', async () => {
    await saveProfile(db, { ...sampleProfile, goals: { ...sampleProfile.goals, sleepHours: 9 } });
    await saveDailyEntry(db, goodDay('2026-10-05'));
    renderWeek('2026-10-05');
    expect(await screen.findByText('0 of 7 nights on target')).toBeInTheDocument();
  });
});

describe('RF-08 pillar averages and days on target (F3-WK-02)', () => {
  it('shows each pillar with its average and its days on target', async () => {
    await saveDailyEntry(db, goodDay('2026-10-05'));
    await saveDailyEntry(db, {
      ...goodDay('2026-10-06'),
      pillars: { sleep: { hours: 6.5, quality: 3 } },
    });
    renderWeek('2026-10-06');
    expect(await screen.findByText('7.3 h average')).toBeInTheDocument();
    expect(screen.getByText('1 of 7 nights on target')).toBeInTheDocument();
    expect(screen.getByText('45 min per workout')).toBeInTheDocument();
    expect(screen.getByText('1 of 3 workouts')).toBeInTheDocument();
    expect(screen.getByText('5 out of 5 average')).toBeInTheDocument();
    expect(screen.getByText('30 min average')).toBeInTheDocument();
  });

  it('says nothing is logged for a pillar without values', async () => {
    renderWeek('2026-10-12');
    expect(await screen.findAllByText(en.pillars.noData)).toHaveLength(4);
  });

  it('has a name and texts for every pillar of the registry', () => {
    const ids = pillarRegistry.list().map((pillar) => pillar.id);
    expect([...PILLARS_WITH_TEXT].sort()).toEqual([...ids].sort());
    for (const id of ids) {
      expect(Object.hasOwn(en.pillars, id)).toBe(true);
    }
  });
});
