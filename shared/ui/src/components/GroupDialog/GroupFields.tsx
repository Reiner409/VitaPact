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

type ErrorOf = (...kinds: GroupDetailsError[]) => { error: string } | undefined;

/** RF-25: a stake the group writes itself, or a new one from the app's list every week. */
function StakeChoice({ fields, text, errorOf }: GroupFieldsProps & { errorOf: ErrorOf }) {
  const rotates = fields.stakeRotates === true;
  return (
    <>
      <ChipGroup
        label={text.stakeChoice}
        options={[
          { value: 'own', label: text.stakeOwn },
          { value: 'rotating', label: text.stakeRotating },
        ]}
        value={rotates ? 'rotating' : 'own'}
        onChange={(choice) => fields.setStakeRotates(choice === 'rotating')}
      />
      {rotates ? (
        <p>{text.stakeRotatingHint}</p>
      ) : (
        <TextField
          label={text.stake}
          value={fields.stake}
          onChange={fields.setStake}
          maxLength={GROUP_STAKE_MAX_LENGTH}
          formatCounter={text.counter}
          placeholder={text.stakePlaceholder}
          {...errorOf('stakeMissing', 'stakeTooLong')}
        />
      )}
    </>
  );
}

/** Name, stake and members of a group, each with the error core found in it. */
export function GroupFields(props: GroupFieldsProps) {
  const { fields, text } = props;
  const errorOf: ErrorOf = (...kinds) => {
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
      <StakeChoice {...props} errorOf={errorOf} />
      <MemberChoice {...props} />
    </>
  );
}
