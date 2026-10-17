import { toCalendarDate, type CalendarDate } from '@vitapact/core/calendar';
import type { Group, Profile, VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, EmptyState, PageHeader, Stack } from '@vitapact/ui';
import { useState } from 'react';
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
  return { data, selected, setSelectedId, creating, setCreating, create, addReport, savedFrom };
}

type FriendsScreenState = ReturnType<typeof useFriendsScreen>;

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
  const { addReport, data } = screen;
  return (
    <>
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
        <GroupPanel data={data} selected={selected} onSelect={screen.setSelectedId} />
      )}
      <FriendsDialogs screen={screen} />
    </Stack>
  );
}
