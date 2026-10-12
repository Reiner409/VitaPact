import type { Friend, Group } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Card } from '@vitapact/ui';

export interface GroupOverviewProps {
  group: Group;
  friends: readonly Friend[];
}

/** The stake and the members of the chosen group; the ranking takes their place in node F3. */
export function GroupOverview({ group, friends }: GroupOverviewProps) {
  const { t } = useTranslation('friends');
  const nicknames = new Map(friends.map(({ userId, nickname }) => [userId, nickname]));
  const members = group.memberIds.flatMap((userId) => {
    const nickname = nicknames.get(userId);
    return nickname === undefined ? [] : [{ userId, nickname }];
  });
  return (
    <Card>
      <p>{t('group.stake', { stake: group.stake })}</p>
      {members.length === 0 ? (
        <p>{t('group.noMembers')}</p>
      ) : (
        <ul aria-label={t('group.members')}>
          {members.map(({ userId, nickname }) => (
            <li key={userId}>{nickname}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
