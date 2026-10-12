import type { Profile } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Button, Card, YesNoToggle } from '@vitapact/ui';
import { useId } from 'react';
import { GoalFields } from './GoalFields';
import { NicknameField } from './NicknameField';
import { ProfileNoticeToast } from './ProfileNoticeToast';
import { UserIdField } from './UserIdField';
import { useProfileEditor, type ProfileActions } from './useProfileEditor';

export interface ProfileCardProps extends ProfileActions {
  profile: Profile;
}

export function ProfileCard({ profile, ...actions }: ProfileCardProps) {
  const { t } = useTranslation('settings');
  const headingId = useId();
  const { form, errors, ...editor } = useProfileEditor(profile, actions);

  return (
    <section aria-labelledby={headingId}>
      <Card>
        <h2 id={headingId}>{t('profile.title')}</h2>
        <NicknameField
          value={form.nickname}
          error={errors.nickname}
          onChange={(nickname) => editor.change({ nickname })}
        />
        <GoalFields goals={form.goals} errors={errors.goals} onChange={editor.changeGoal} />
        <YesNoToggle
          label={t('profile.hideWeight')}
          yesLabel={t('profile.yes')}
          noLabel={t('profile.no')}
          value={form.hideWeight}
          onChange={(hideWeight) => editor.change({ hideWeight })}
        />
        <UserIdField userId={profile.userId} onCopy={() => void editor.copyUserId()} />
        <Button loading={editor.saving} onClick={() => void editor.save()}>
          {t('profile.save')}
        </Button>
      </Card>
      <ProfileNoticeToast notice={editor.notice} onClose={editor.closeNotice} />
    </section>
  );
}
