import { toCalendarDate, type CalendarDate } from '@vitapact/core/calendar';
import type { Friend, Group, Profile, VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, EmptyState, PageHeader, Stack } from '@vitapact/ui';
import { useState } from 'react';
import { FriendDialog } from './friend/FriendDialog';
import { createGroup, type NewGroup } from './groups/groupStore';
import { GroupPanel } from './groups/GroupPanel';
import { NewGroupDialog } from './groups/NewGroupDialog';
import { useFriendsData } from './groups/useFriendsData';
import { AddReportDialog } from './report/AddReportDialog';
import {
  pickReportFromImage,
  readReportImage,
  type PickReport,
  type ReadReportImage,
} from './report/pickReport';
import { useAddReport } from './report/useAddReport';
import { usePastedReport } from './report/usePastedReport';

export interface FriendsScreenProps {
  db: VitaPactDatabase;
  profile?: Profile | undefined;
  /** Read when a group or report is saved; tests pass a fixed moment. */
  now?: () => Date;
  /** Injected by tests; the app uses today's date. */
  today?: CalendarDate;
  /** Injected by tests; the app opens the system file dialog. */
  pickReport?: PickReport;
  readImage?: ReadReportImage;
}

const pickGroup = (groups: readonly Group[], id: string | undefined) =>
  groups.find((group) => group.id === id) ?? groups[0];

function useFriendsScreen({
  db,
  profile,
  now = () => new Date(),
  today = toCalendarDate(new Date()),
  pickReport = pickReportFromImage,
  readImage = readReportImage,
}: FriendsScreenProps) {
  const { t } = useTranslation('friends');
  const { data, reload } = useFriendsData(db, profile, today);
  const detail = useFriendDetail(data?.friends ?? [], reload);
  const [selectedId, setSelectedId] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [savedFrom, setSavedFrom] = useState<string>();
  const addReport = useAddReport({
    db,
    ownUserId: profile?.userId ?? '',
    pickReport,
    readImage,
    filterName: t('addReport.filterName'),
    now,
    onSaved: async (nickname) => {
      setSavedFrom(nickname);
      await reload();
    },
  });
  usePastedReport((image) => void addReport.openPasted(image));

  async function create(newGroup: NewGroup) {
    const group = await createGroup(db, newGroup, now());
    setSelectedId(group.id);
    await reload();
  }
  const selected = data && pickGroup(data.groups, selectedId);
  return {
    ...{ db, data, selected, setSelectedId, creating, setCreating },
    ...{ create, addReport, savedFrom, detail },
  };
}

type FriendsScreenState = ReturnType<typeof useFriendsScreen>;

/** F3-FR-08: the friend whose history is open, and the notice once one is removed. */
function useFriendDetail(friends: readonly Friend[], reload: () => Promise<void>) {
  const [friendId, setFriendId] = useState<string>();
  const [removed, setRemoved] = useState<string>();
  const friend = friends.find(({ userId }) => userId === friendId);
  return {
    friend,
    removed,
    open: setFriendId,
    close: () => setFriendId(undefined),
    onRemoved: async () => {
      setRemoved(friend?.nickname);
      setFriendId(undefined);
      await reload();
    },
  };
}

function FriendsActions({ screen }: { screen: FriendsScreenState }) {
  const { t } = useTranslation('friends');
  return (
    <Stack horizontal gap="tight">
      <Button onClick={() => void screen.addReport.open()}>{t('addReport.open')}</Button>
      {screen.selected && (
        <Button variant="secondary" onClick={() => screen.setCreating(true)}>
          {t('newGroup.open')}
        </Button>
      )}
    </Stack>
  );
}

function FriendsDialogs({ screen }: { screen: FriendsScreenState }) {
  const { addReport, data, detail } = screen;
  return (
    <>
      {data && (
        <FriendDialog
          db={screen.db}
          friend={detail.friend}
          lastWeek={data.rankingWeek}
          onClose={detail.close}
          onRemoved={detail.onRemoved}
        />
      )}
      <NewGroupDialog
        opened={screen.creating}
        friends={data?.friends ?? []}
        onCreate={screen.create}
        onClose={() => screen.setCreating(false)}
      />
      <AddReportDialog
        state={addReport.state}
        groups={data?.groups ?? []}
        onConfirm={(groupIds) => void addReport.confirm(groupIds)}
        onChooseAnother={() => void addReport.open()}
        onClose={addReport.close}
      />
    </>
  );
}

export function FriendsScreen(props: FriendsScreenProps) {
  const { t } = useTranslation('friends');
  const screen = useFriendsScreen(props);
  const { data, selected } = screen;
  return (
    <Stack>
      <PageHeader
        title={t('title')}
        subtitle={t('addReport.pasteHint')}
        action={<FriendsActions screen={screen} />}
      />
      {screen.detail.removed !== undefined && (
        <Banner tone="info">{t('remove.done', { nickname: screen.detail.removed })}</Banner>
      )}
      {screen.savedFrom !== undefined && (
        <Banner tone="info">{t('addReport.saved', { nickname: screen.savedFrom })}</Banner>
      )}
      {data && !selected && (
        <EmptyState
          icon="friends"
          title={t('empty.title')}
          description={t('empty.description')}
          action={{ label: t('newGroup.open'), onClick: () => screen.setCreating(true) }}
        />
      )}
      {data && selected && (
        <GroupPanel
          data={data}
          selected={selected}
          onSelect={screen.setSelectedId}
          onSelectFriend={screen.detail.open}
        />
      )}
      <FriendsDialogs screen={screen} />
    </Stack>
  );
}
