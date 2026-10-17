import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSigningKeys } from '@vitapact/core/crypto';
import { createReport, type WeekReportInput } from '@vitapact/core/report';
import { verdictBand } from '@vitapact/core/scoring';
import {
  getFriend,
  getFriendReport,
  listGroups,
  saveGroup,
  type Group,
} from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import content from '@vitapact/i18n/locales/en/content.json';
import { renderWithProviders } from '@vitapact/ui/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import en from '../../locales/en/friends.json';
import { FriendsScreen } from '../FriendsScreen';
import type { PickedReport } from './pickReport';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const now = () => new Date('2026-10-12T09:00:00.000Z');
const today = '2026-10-12';
const giulia: WeekReportInput = {
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b91',
  nickname: 'Giulia',
  hideWeight: false,
  generatedOn: '2026-10-11',
  week: '2026-W41',
  logged: 6,
  sleepAvg: 7.5,
  sleepOk: 5,
  trainDone: 3,
  trainGoal: 3,
  trainMin: 150,
  cleanOk: 4,
  sunOk: 3,
  score: 74,
};
const keys = await createSigningKeys();
const giuliaReport = await createReport(giulia, keys);

const office: Group = {
  id: 'group-office',
  name: 'Office',
  stake: 'brings the coffee',
  memberIds: [],
  createdAt: '2026-10-04T09:00:00.000Z',
};
const running: Group = { ...office, id: 'group-running', name: 'Running club' };

async function renderFriends(
  picked: PickedReport | PickedReport[],
  groups: Group[] = [office, running],
) {
  const db = await openTestDatabase();
  await Promise.all(groups.map((group) => saveGroup(db, group)));
  const queue = Array.isArray(picked) ? [...picked] : [picked];
  const next = (): Promise<PickedReport> =>
    Promise.resolve((queue.length > 1 ? queue.shift() : queue[0]) as PickedReport);
  const pickReport = vi.fn(next);
  const readImage = vi.fn(next);
  renderWithProviders(
    <FriendsScreen
      db={db}
      profile={sampleProfile}
      now={now}
      today={today}
      pickReport={pickReport}
      readImage={readImage}
    />,
    { translations: { friends: en, content } },
  );
  await screen.findByRole('heading', { level: 1, name: en.title });
  return { db, pickReport, readImage, user: userEvent.setup() };
}

const asContent = (content: Uint8Array): PickedReport => ({ kind: 'content', content });

/** Adds the report the next pick returns, in no group, and waits for the notice. */
async function addNext(user: ReturnType<typeof userEvent.setup>, nickname: string) {
  await openAdd(user);
  const add = await dialog();
  await user.click(await within(add).findByRole('button', { name: en.addReport.confirm }));
  await screen.findByText(`${nickname}'s report was added.`);
}

const dialog = () => screen.findByRole('dialog', { name: en.addReport.title });
const openAdd = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: en.addReport.open }));

describe('F3-FR-03 RF-12 add a friend report', () => {
  it('shows whose report it is, adds the new friend to the chosen groups and saves it', async () => {
    const { db, user } = await renderFriends({ kind: 'content', content: giuliaReport });
    await openAdd(user);
    const add = await dialog();
    expect(await within(add).findByText('Giulia · week 41')).toBeInTheDocument();
    expect(
      within(add).getByText(`Score 74 · ${content.verdict[verdictBand(74)].title}`),
    ).toBeInTheDocument();
    expect(within(add).getByText('This is the first report from Giulia.')).toBeInTheDocument();

    await user.click(within(add).getByRole('checkbox', { name: 'Office' }));
    await user.click(within(add).getByRole('checkbox', { name: 'Running club' }));
    await user.click(within(add).getByRole('button', { name: en.addReport.confirm }));

    expect(await screen.findByText("Giulia's report was added.")).toBeInTheDocument();
    expect(await getFriend(db, giulia.userId)).toMatchObject({ nickname: 'Giulia' });
    expect(await getFriendReport(db, giulia.userId, giulia.week)).toBeDefined();
    const groups = await listGroups(db);
    expect(groups.every((group) => group.memberIds.includes(giulia.userId))).toBe(true);
  });

  it('saves nothing when the user cancels after the preview', async () => {
    const { db, user } = await renderFriends({ kind: 'content', content: giuliaReport });
    await openAdd(user);
    await user.click(
      await within(await dialog()).findByRole('button', { name: en.addReport.cancel }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await getFriend(db, giulia.userId)).toBeUndefined();
  });

  it('says the same week will be replaced when the report was already added', async () => {
    const { user } = await renderFriends({ kind: 'content', content: giuliaReport });
    await openAdd(user);
    await user.click(
      await within(await dialog()).findByRole('button', { name: en.addReport.confirm }),
    );
    await screen.findByText("Giulia's report was added.");
    await openAdd(user);
    const again = await dialog();
    expect(
      await within(again).findByText(
        "You already added Giulia's report for week 41. This one replaces it.",
      ),
    ).toBeInTheDocument();
    expect(within(again).queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('explains why an image is not a report and offers another one', async () => {
    const { pickReport, user } = await renderFriends({ kind: 'failed', reason: 'noQrCode' });
    await openAdd(user);
    const add = await dialog();
    expect(await within(add).findByText(en.addReport.problems.noQrCode)).toBeInTheDocument();
    await user.click(within(add).getByRole('button', { name: en.addReport.chooseAnother }));
    expect(pickReport).toHaveBeenCalledTimes(2);
  });

  it('opens nothing when the file dialog is cancelled', async () => {
    const { user } = await renderFriends({ kind: 'cancelled' });
    await openAdd(user);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('offers the groups later when there are none yet', async () => {
    const { user } = await renderFriends({ kind: 'content', content: giuliaReport }, []);
    await openAdd(user);
    expect(
      await within(await dialog()).findByText(
        'You can add Giulia to a group later, from Settings.',
      ),
    ).toBeInTheDocument();
  });
});

describe('F3-FR-03 RF-12 RF-28 every outcome of reading a report', () => {
  it.each(Object.entries(en.addReport.problems))(
    'explains the %s problem',
    async (reason, text) => {
      const { user } = await renderFriends({
        kind: 'failed',
        reason: reason as Extract<PickedReport, { kind: 'failed' }>['reason'],
      });
      await openAdd(user);
      expect(await within(await dialog()).findByText(text)).toBeInTheDocument();
    },
  );

  it('updates a known friend with a new week, without asking for groups again', async () => {
    const nextWeek = await createReport(
      { ...giulia, nickname: 'Giuly', week: '2026-W42', generatedOn: '2026-10-18' },
      keys,
    );
    const { db, user } = await renderFriends([asContent(giuliaReport), asContent(nextWeek)]);
    await addNext(user, 'Giulia');
    await openAdd(user);
    const add = await dialog();
    expect(await within(add).findByText('Giuly · week 42')).toBeInTheDocument();
    expect(within(add).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(within(add).queryByText(/already added/)).not.toBeInTheDocument();
    await user.click(within(add).getByRole('button', { name: en.addReport.confirm }));
    await screen.findByText("Giuly's report was added.");
    expect(await getFriend(db, giulia.userId)).toMatchObject({ nickname: 'Giuly' });
  });

  it('refuses a report from a known friend signed with another key', async () => {
    const forged = await createReport(
      { ...giulia, week: '2026-W42', generatedOn: '2026-10-18' },
      await createSigningKeys(),
    );
    const { db, user } = await renderFriends([asContent(giuliaReport), asContent(forged)]);
    await addNext(user, 'Giulia');
    await openAdd(user);
    expect(
      await within(await dialog()).findByText(en.addReport.problems.keyChanged),
    ).toBeInTheDocument();
    expect(await getFriendReport(db, giulia.userId, '2026-W42')).toBeUndefined();
  });

  it('refuses the user own report', async () => {
    const own = await createReport({ ...giulia, userId: sampleProfile.userId }, keys);
    const { user } = await renderFriends(asContent(own));
    await openAdd(user);
    expect(
      await within(await dialog()).findByText(en.addReport.problems.ownReport),
    ).toBeInTheDocument();
  });
});

describe('F3-FR-04 RF-25 a new friend in groups', () => {
  it('allows choosing no group', async () => {
    const { db, user } = await renderFriends(asContent(giuliaReport));
    await addNext(user, 'Giulia');
    expect(await getFriend(db, giulia.userId)).toBeDefined();
    const groups = await listGroups(db);
    expect(groups.some((group) => group.memberIds.includes(giulia.userId))).toBe(false);
  });
});

describe('F3-FR-05 RF-13 the weekly ranking', () => {
  it('orders friends by score and keeps You as waiting without a report', async () => {
    const marco = await createReport(
      { ...giulia, userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b92', nickname: 'Marco', score: 88 },
      await createSigningKeys(),
    );
    const { user } = await renderFriends([asContent(giuliaReport), asContent(marco)]);
    for (const nickname of ['Giulia', 'Marco']) {
      await openAdd(user);
      const add = await dialog();
      await user.click(await within(add).findByRole('checkbox', { name: 'Office' }));
      await user.click(within(add).getByRole('button', { name: en.addReport.confirm }));
      await screen.findByText(`${nickname}'s report was added.`);
    }
    const rows = within(screen.getByRole('list', { name: 'Week 41 ranking' })).getAllByRole(
      'listitem',
    );
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Marco'),
      expect.stringContaining('Giulia'),
      expect.stringContaining(sampleProfile.nickname),
    ]);
    expect(rows[2]).toHaveTextContent(en.ranking.waiting);
  });
});

describe('F3-FR-04 RF-12 paste a report image', () => {
  it('reads an image pasted with Ctrl+V', async () => {
    const { readImage } = await renderFriends({ kind: 'content', content: giuliaReport });
    const image = new File([new Uint8Array([1])], 'report.png', { type: 'image/png' });
    fireEvent.paste(document, { clipboardData: { files: [image] } });
    expect(await within(await dialog()).findByText('Giulia · week 41')).toBeInTheDocument();
    expect(readImage).toHaveBeenCalledWith(image);
  });

  it('says a pasted file that is not an image is not a report', async () => {
    const { readImage } = await renderFriends({ kind: 'content', content: giuliaReport });
    const text = new File(['hello'], 'note.txt', { type: 'text/plain' });
    fireEvent.paste(document, { clipboardData: { files: [text] } });
    expect(
      await within(await dialog()).findByText(en.addReport.problems.notAnImage),
    ).toBeInTheDocument();
    expect(readImage).not.toHaveBeenCalled();
  });

  it('ignores a paste of plain text', async () => {
    await renderFriends({ kind: 'content', content: giuliaReport });
    fireEvent.paste(document, { clipboardData: { files: [] } });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
