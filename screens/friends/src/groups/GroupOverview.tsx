import type { Group } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Card, Stack } from '@vitapact/ui';
import { GroupRankings } from '../ranking/GroupRankings';
import type { FriendsData } from './groupStore';
import { PayerCard } from './PayerCard';

export interface GroupOverviewProps {
  group: Group;
  data: FriendsData;
  onSelectFriend: (userId: string) => void;
}

/** The stake of the chosen group, who pays this weekend, then its rankings (section 5.4). */
export function GroupOverview({ group, data, onSelectFriend }: GroupOverviewProps) {
  const { t } = useTranslation('friends');
  return (
    <Stack>
      <Card>
        <p>{t('group.stake', { stake: group.stake })}</p>
        {group.memberIds.length === 0 && <p>{t('group.noMembers')}</p>}
      </Card>
      <PayerCard group={group} data={data} />
      <GroupRankings data={data} group={group} onSelectFriend={onSelectFriend} />
    </Stack>
  );
}
