import type { Friend } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Banner, Button, Modal, Stack } from '@vitapact/ui';
import { GroupFields } from './GroupFields';
import type { NewGroup } from './groupStore';
import { useNewGroupForm } from './useNewGroupForm';

export interface NewGroupDialogProps {
  opened: boolean;
  friends: readonly Friend[];
  onCreate: (group: NewGroup) => Promise<void>;
  onClose: () => void;
}

/** RF-25: name, stake and members chosen among the friends already imported. */
export function NewGroupDialog({ opened, friends, onCreate, onClose }: NewGroupDialogProps) {
  const { t } = useTranslation('friends');
  const { fields, saving, saveFailed, submit, close } = useNewGroupForm(onCreate, onClose);
  return (
    <Modal opened={opened} onClose={close} title={t('newGroup.title')} closeLabel={t('close')}>
      <form onSubmit={(event) => void submit(event)} noValidate>
        <Stack>
          <GroupFields fields={fields} friends={friends} />
          {saveFailed && (
            <Banner tone="warning" icon="error">
              {t('newGroup.saveFailed')}
            </Banner>
          )}
          <Button type="submit" loading={saving}>
            {t('newGroup.create')}
          </Button>
          <Button variant="subtle" onClick={close}>
            {t('newGroup.cancel')}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
