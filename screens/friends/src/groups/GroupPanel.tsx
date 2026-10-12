import type { Group } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Select } from '@vitapact/ui';
import type { FriendsData } from './groupStore';
import { GroupOverview } from './GroupOverview';

export interface GroupPanelProps {
  data: FriendsData;
  selected: Group;
  onSelect: (groupId: string) => void;
}

/** RF-25: the group selector and what the chosen group shows. */
export function GroupPanel({ data, selected, onSelect }: GroupPanelProps) {
  const { t } = useTranslation('friends');
  return (
    <>
      <Select
        label={t('group.select')}
        options={data.groups.map(({ id, name }) => ({ value: id, label: name }))}
        value={selected.id}
        onChange={onSelect}
      />
      <GroupOverview group={selected} friends={data.friends} />
    </>
  );
}
