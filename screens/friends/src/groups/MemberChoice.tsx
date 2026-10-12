import type { Friend } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { ChipGroup } from '@vitapact/ui';

export interface MemberChoiceProps {
  friends: readonly Friend[];
  memberIds: readonly string[];
  onChange: (memberIds: string[]) => void;
}

/** RF-25: members are picked among the friends already imported; none is fine. */
export function MemberChoice({ friends, memberIds, onChange }: MemberChoiceProps) {
  const { t } = useTranslation('friends');
  if (friends.length === 0) return <p>{t('newGroup.noFriendsYet')}</p>;
  return (
    <ChipGroup
      multiple
      label={t('newGroup.members')}
      options={friends.map(({ userId, nickname }) => ({ value: userId, label: nickname }))}
      value={[...memberIds]}
      onChange={onChange}
    />
  );
}
