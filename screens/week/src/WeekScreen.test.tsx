import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveDailyEntry, saveWeighIn, type DailyEntry } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import content from '@vitapact/i18n/locales/en/content.json';
import pillars from '@vitapact/i18n/locales/en/pillars.json';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it, vi } from 'vitest';
import en from '../locales/en/week.json';
import { WeekScreen, type WeekScreenProps } from './WeekScreen';

const THURSDAY = '2026-10-15';

const loggedDay = (date: string): DailyEntry => ({
  date,
  pillars: {
    sleep: { hours: 8, quality: 4 },
    training: { trained: true, type: 'running', minutes: 40 },
    food: { rating: 5 },
    sun: { minutes: 30 },
  },
  updatedAt: `${date}T21:00:00Z`,
});

async function renderWeek(props: Partial<WeekScreenProps> = {}) {
  const db = props.db ?? (await openTestDatabase());
  renderWithProviders(<WeekScreen db={db} profile={sampleProfile} today={THURSDAY} {...props} />, {
    translations: { week: en, pillars, content },
  });
  return db;
}

const weekLabel = () => screen.getByText(/^Week \d+ · /);

describe('F3-WK-01 week selector', () => {
  it('RF-08 opens on the current week with the forward arrow disabled', async () => {
    await renderWeek();
    expect(weekLabel()).toHaveTextContent('Week 42 · Oct 12 to Oct 18');
    expect(screen.getByRole('button', { name: en.selector.next })).toBeDisabled();
  });

  it('RF-08 goes back across the new year and forward again', async () => {
    await renderWeek({ today: '2026-01-07' });
    await userEvent.click(screen.getByRole('button', { name: en.selector.previous }));
    expect(weekLabel()).toHaveTextContent('Week 1 · Dec 29 to Jan 4');
    await userEvent.click(screen.getByRole('button', { name: en.selector.previous }));
    expect(weekLabel()).toHaveTextContent('Week 52 · Dec 22 to Dec 28');
    await userEvent.click(screen.getByRole('button', { name: en.selector.next }));
    expect(weekLabel()).toHaveTextContent('Week 1 · Dec 29 to Jan 4');
  });
});

describe('F3-WK-02 score and pillars', () => {
  it('RF-09 puts the score and its verdict first', async () => {
    await renderWeek();
    expect(await screen.findByRole('meter', { name: en.score })).toBeInTheDocument();
    expect(screen.getByText(content.verdict.pauseWeek.title)).toBeInTheDocument();
  });

  it('RF-08 shows the four pillars with their days on target', async () => {
    const db = await openTestDatabase();
    await saveDailyEntry(db, loggedDay('2026-10-12'));
    await saveDailyEntry(db, loggedDay('2026-10-13'));
    await renderWeek({ db });
    expect(await screen.findByText('8 h average')).toBeInTheDocument();
    expect(screen.getByText('2 of 3 workouts')).toBeInTheDocument();
    expect(screen.getByText('80 min in total')).toBeInTheDocument();
  });
});

/** Waits for the day strip once it shows the given number of days without a log. */
async function loggedTiles(missing: number) {
  await waitFor(() => {
    const list = screen.getByRole('list', { name: en.days.label });
    expect(within(list).getAllByText(en.days.missing)).toHaveLength(missing);
  });
  return within(screen.getByRole('list', { name: en.days.label }));
}

describe('F3-WK-03 F3-WK-04 day tiles and detail', () => {
  it('RF-04 opens a logged day and edits it on Today while the week is open', async () => {
    const db = await openTestDatabase();
    await saveDailyEntry(db, loggedDay('2026-10-13'));
    const onEditDay = vi.fn();
    await renderWeek({ db, onEditDay });
    const tiles = await loggedTiles(6);
    await userEvent.click(tiles.getByRole('button', { name: /^Tue/ }));
    const dialog = within(await screen.findByRole('dialog', { name: 'Tuesday, October 13' }));
    expect(dialog.getByText('Workout: Running')).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', { name: en.day.edit }));
    expect(onEditDay).toHaveBeenCalledWith('2026-10-13');
  });

  it('RF-04 keeps a closed week read-only', async () => {
    const db = await openTestDatabase();
    await saveDailyEntry(db, loggedDay('2026-10-06'));
    await renderWeek({ db, onEditDay: vi.fn() });
    await userEvent.click(screen.getByRole('button', { name: en.selector.previous }));
    const tiles = await loggedTiles(6);
    await userEvent.click(tiles.getByRole('button', { name: /^Tue/ }));
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.queryByRole('button', { name: en.day.edit })).not.toBeInTheDocument();
  });
});

describe('F3-WK-05 weight chart', () => {
  it('RF-08 invites the first weigh-in when there is none', async () => {
    await renderWeek();
    expect(await screen.findByText(en.weight.empty)).toBeInTheDocument();
  });

  it('RF-08 draws the chart once a Sunday has a weigh-in', async () => {
    const db = await openTestDatabase();
    await saveWeighIn(db, {
      week: '2026-W41',
      weightKg: 78.4,
      measuredOn: '2026-10-11',
      fastingConfirmed: true,
    });
    await renderWeek({ db });
    expect(await screen.findByRole('img', { name: en.weight.label })).toBeInTheDocument();
  });
});
