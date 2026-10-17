import { GROUP_NAME_MAX_LENGTH, GROUP_STAKE_MAX_LENGTH } from '@vitapact/core/groups';
import { useTranslation } from '@vitapact/i18n';
import type { GroupDialogText } from '@vitapact/ui';

/** The shared group dialog in settings' words, for a new group or one being edited (G5.5). */
export function useGroupDialogText(editing: boolean): GroupDialogText {
  const { t } = useTranslation('settings');
  return {
    title: editing ? t('groups.dialog.editTitle') : t('groups.dialog.newTitle'),
    submit: editing ? t('groups.dialog.save') : t('groups.dialog.create'),
    cancel: t('groups.dialog.cancel'),
    close: t('groups.dialog.close'),
    name: t('groups.dialog.name'),
    stake: t('groups.dialog.stake'),
    stakePlaceholder: t('groups.dialog.stakePlaceholder'),
    members: t('groups.dialog.members'),
    noFriendsYet: t('groups.dialog.noFriendsYet'),
    saveFailed: t('groups.dialog.saveFailed'),
    counter: (length, max) => t('groups.dialog.counter', { length, max }),
    errors: {
      nameMissing: t('groups.dialog.errors.nameMissing'),
      nameTooLong: t('groups.dialog.errors.nameTooLong', { max: GROUP_NAME_MAX_LENGTH }),
      stakeMissing: t('groups.dialog.errors.stakeMissing'),
      stakeTooLong: t('groups.dialog.errors.stakeTooLong', { max: GROUP_STAKE_MAX_LENGTH }),
    },
  };
}
