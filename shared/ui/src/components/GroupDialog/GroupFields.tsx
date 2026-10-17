import {
  GROUP_NAME_MAX_LENGTH,
  GROUP_STAKE_MAX_LENGTH,
  type GroupDetailsError,
} from '@vitapact/core/groups';
import { ChipGroup } from '../ChipGroup/ChipGroup';
import { TextField } from '../TextField/TextField';
import type { GroupDialogFriend, GroupDialogText } from './GroupDialog';
import type { GroupFormFields } from './useGroupForm';

export interface GroupFieldsProps {
  fields: GroupFormFields;
  friends: readonly GroupDialogFriend[];
  text: GroupDialogText;
}

const firstOf = (errors: readonly GroupDetailsError[], ...kinds: GroupDetailsError[]) =>
  errors.find((error) => kinds.includes(error));

function MemberChoice({ fields, friends, text }: GroupFieldsProps) {
  if (friends.length === 0) return <p>{text.noFriendsYet}</p>;
  return (
    <ChipGroup
      multiple
      label={text.members}
      options={friends.map(({ userId, nickname }) => ({ value: userId, label: nickname }))}
      value={[...fields.memberIds]}
      onChange={fields.setMemberIds}
    />
  );
}

/** Name, stake and members of a group, each with the error core found in it. */
export function GroupFields(props: GroupFieldsProps) {
  const { fields, text } = props;
  const errorOf = (...kinds: GroupDetailsError[]) => {
    const error = firstOf(fields.errors, ...kinds);
    return error && { error: text.errors[error] };
  };
  return (
    <>
      <TextField
        label={text.name}
        value={fields.name}
        onChange={fields.setName}
        maxLength={GROUP_NAME_MAX_LENGTH}
        formatCounter={text.counter}
        {...errorOf('nameMissing', 'nameTooLong')}
      />
      <TextField
        label={text.stake}
        value={fields.stake}
        onChange={fields.setStake}
        maxLength={GROUP_STAKE_MAX_LENGTH}
        formatCounter={text.counter}
        placeholder={text.stakePlaceholder}
        {...errorOf('stakeMissing', 'stakeTooLong')}
      />
      <MemberChoice {...props} />
    </>
  );
}
