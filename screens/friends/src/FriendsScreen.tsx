import type { Group, VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Button, EmptyState, PageHeader } from '@vitapact/ui';
import { useState } from 'react';
import { createGroup, type NewGroup } from './groups/groupStore';
import { GroupPanel } from './groups/GroupPanel';
import { NewGroupDialog } from './groups/NewGroupDialog';
import { useFriendsData } from './groups/useFriendsData';

export interface FriendsScreenProps {
  db: VitaPactDatabase;
  /** Read when a group is created; tests pass a fixed moment. */
  now?: () => Date;
}

const pickGroup = (groups: readonly Group[], id: string | undefined) =>
  groups.find((group) => group.id === id) ?? groups[0];

export function FriendsScreen({ db, now = () => new Date() }: FriendsScreenProps) {
  const { t } = useTranslation('friends');
  const { data, reload } = useFriendsData(db);
  const [selectedId, setSelectedId] = useState<string>();
  const [creating, setCreating] = useState(false);

  async function create(newGroup: NewGroup) {
    const group = await createGroup(db, newGroup, now());
    setSelectedId(group.id);
    await reload();
  }

  const openNewGroup = () => setCreating(true);
  const selected = data && pickGroup(data.groups, selectedId);
  const newGroupButton = (
    <Button variant="secondary" onClick={openNewGroup}>
      {t('newGroup.open')}
    </Button>
  );
  return (
    <>
      <PageHeader title={t('title')} action={selected && newGroupButton} />
      {data && !selected && (
        <EmptyState
          icon="friends"
          title={t('empty.title')}
          description={t('empty.description')}
          action={{ label: t('newGroup.open'), onClick: openNewGroup }}
        />
      )}
      {data && selected && <GroupPanel data={data} selected={selected} onSelect={setSelectedId} />}
      <NewGroupDialog
        opened={creating}
        friends={data?.friends ?? []}
        onCreate={create}
        onClose={() => setCreating(false)}
      />
    </>
  );
}
