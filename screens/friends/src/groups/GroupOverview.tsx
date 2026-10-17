import type { Group } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Card, Stack } from '@vitapact/ui';
import { GroupRankings } from '../ranking/GroupRankings';
import type { FriendsData } from './groupStore';

export interface GroupOverviewProps {
  group: Group;
  data: FriendsData;
}

/** The stake of the chosen group, then its rankings (section 5.4). */
export function GroupOverview({ group, data }: GroupOverviewProps) {
  const { t } = useTranslation('friends');
  return (
    <Stack>
      <Card>
        <p>{t('group.stake', { stake: group.stake })}</p>
        {group.memberIds.length === 0 && <p>{t('group.noMembers')}</p>}
      </Card>
      <GroupRankings data={data} group={group} />
    </Stack>
  );
}
