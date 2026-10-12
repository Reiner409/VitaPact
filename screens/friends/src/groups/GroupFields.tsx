import {
  GROUP_NAME_MAX_LENGTH,
  GROUP_STAKE_MAX_LENGTH,
  type GroupDetailsError,
} from '@vitapact/core/groups';
import type { Friend } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { TextField } from '@vitapact/ui';
import { MemberChoice } from './MemberChoice';
import type { NewGroupFields } from './useNewGroupForm';

export interface GroupFieldsProps {
  fields: NewGroupFields;
  friends: readonly Friend[];
}

const firstOf = (errors: readonly GroupDetailsError[], ...kinds: GroupDetailsError[]) =>
  errors.find((error) => kinds.includes(error));

/** Name, stake and members of a group, each with the error core found in it. */
export function GroupFields({ fields, friends }: GroupFieldsProps) {
  const { t } = useTranslation('friends');
  const errorText: Record<GroupDetailsError, string> = {
    nameMissing: t('newGroup.errors.nameMissing'),
    nameTooLong: t('newGroup.errors.nameTooLong', { max: GROUP_NAME_MAX_LENGTH }),
    stakeMissing: t('newGroup.errors.stakeMissing'),
    stakeTooLong: t('newGroup.errors.stakeTooLong', { max: GROUP_STAKE_MAX_LENGTH }),
  };
  const errorOf = (...kinds: GroupDetailsError[]) => {
    const error = firstOf(fields.errors, ...kinds);
    return error && { error: errorText[error] };
  };
  const formatCounter = (length: number, max: number) => t('newGroup.counter', { length, max });

  return (
    <>
      <TextField
        label={t('newGroup.name')}
        value={fields.name}
        onChange={fields.setName}
        maxLength={GROUP_NAME_MAX_LENGTH}
        formatCounter={formatCounter}
        {...errorOf('nameMissing', 'nameTooLong')}
      />
      <TextField
        label={t('newGroup.stake')}
        value={fields.stake}
        onChange={fields.setStake}
        maxLength={GROUP_STAKE_MAX_LENGTH}
        formatCounter={formatCounter}
        placeholder={t('newGroup.stakePlaceholder')}
        {...errorOf('stakeMissing', 'stakeTooLong')}
      />
      <MemberChoice friends={friends} memberIds={fields.memberIds} onChange={fields.setMemberIds} />
    </>
  );
}
