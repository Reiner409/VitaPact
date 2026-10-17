import type { Group, VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Button, Card, ConfirmDialog, GroupDialog, Stack } from '@vitapact/ui';
import { useId } from 'react';
import { useGroupDialogText } from './useGroupDialogText';
import { useGroups, type GroupAction } from './useGroups';

export interface GroupsCardProps {
  db: VitaPactDatabase;
  now: () => Date;
}

interface GroupRowProps {
  group: Group;
  onAction: (action: GroupAction) => void;
}

function GroupRow({ group, onAction }: GroupRowProps) {
  const { t } = useTranslation('settings');
  return (
    <Card>
      <h3>{group.name}</h3>
      <p>{t('groups.stake', { stake: group.stake })}</p>
      <p>{t('groups.members', { count: group.memberIds.length })}</p>
      <Stack horizontal gap="tight">
        <Button variant="secondary" onClick={() => onAction({ kind: 'edit', group })}>
          {t('groups.edit', { name: group.name })}
        </Button>
        <Button variant="subtle" onClick={() => onAction({ kind: 'delete', group })}>
          {t('groups.delete', { name: group.name })}
        </Button>
      </Stack>
    </Card>
  );
}

function GroupDialogs({ state }: { state: ReturnType<typeof useGroups> }) {
  const { t } = useTranslation('settings');
  const { action, setAction } = state;
  const editing = action?.kind === 'edit' ? action.group : undefined;
  const deleting = action?.kind === 'delete' ? action.group : undefined;
  const close = () => setAction(undefined);
  return (
    <>
      <GroupDialog
        opened={action?.kind === 'create' || editing !== undefined}
        friends={state.friends}
        {...(editing && { initial: editing })}
        text={useGroupDialogText(editing !== undefined)}
        onSave={state.save}
        onClose={close}
      />
      <ConfirmDialog
        opened={deleting !== undefined}
        onClose={close}
        onConfirm={() => deleting && void state.remove(deleting)}
        title={t('groups.confirmDelete.title', { name: deleting?.name ?? '' })}
        message={t('groups.confirmDelete.message')}
        confirmLabel={t('groups.confirmDelete.confirm')}
        cancelLabel={t('groups.dialog.cancel')}
        closeLabel={t('groups.dialog.close')}
        destructive
      />
    </>
  );
}

/** F3-ST-02: every group with its stake and members; create, edit or delete one (RF-25). */
export function GroupsCard({ db, now }: GroupsCardProps) {
  const { t } = useTranslation('settings');
  const headingId = useId();
  const state = useGroups(db, now);
  return (
    <section aria-labelledby={headingId}>
      <Card>
        <Stack>
          <h2 id={headingId}>{t('groups.title')}</h2>
          {state.groups.length === 0 && <p>{t('groups.empty')}</p>}
          {state.groups.map((group) => (
            <GroupRow key={group.id} group={group} onAction={state.setAction} />
          ))}
          <div>
            <Button onClick={() => state.setAction({ kind: 'create' })}>{t('groups.new')}</Button>
          </div>
        </Stack>
      </Card>
      <GroupDialogs state={state} />
    </section>
  );
}
