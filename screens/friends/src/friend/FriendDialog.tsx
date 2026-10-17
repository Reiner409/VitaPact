import type { IsoWeek } from '@vitapact/core/calendar';
import {
  listFriendReportsOf,
  removeFriend,
  type Friend,
  type FriendReport,
  type VitaPactDatabase,
} from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { Button, ConfirmDialog, Modal, Stack, TrendChart } from '@vitapact/ui';
import { useEffect, useState } from 'react';
import { historyOf, scoreOf, weightOf, type HistoryPoint } from './friendHistory';

export interface FriendDialogProps {
  db: VitaPactDatabase;
  /** The friend whose history is open; `undefined` keeps the dialog closed. */
  friend: Friend | undefined;
  lastWeek: IsoWeek;
  onClose: () => void;
  /** Called after the friend was removed, so the screen reloads its rankings. */
  onRemoved: () => Promise<void>;
}

const weekLabel = (week: IsoWeek) => week.slice(week.indexOf('W'));
const chartPoints = (points: HistoryPoint[]) =>
  points.map(({ week, value }) => ({ label: weekLabel(week), value }));

function useReportsOf(db: VitaPactDatabase, userId: string | undefined) {
  const [reports, setReports] = useState<FriendReport[]>([]);
  useEffect(() => {
    let current = true;
    if (userId)
      void listFriendReportsOf(db, userId).then((loaded) => current && setReports(loaded));
    return () => {
      current = false;
    };
  }, [db, userId]);
  return reports;
}

function FriendHistory({ reports, lastWeek }: { reports: FriendReport[]; lastWeek: IsoWeek }) {
  const { t } = useTranslation('friends');
  const weights = historyOf(reports, lastWeek, weightOf);
  const missingLabel = t('history.missing');
  return (
    <>
      <TrendChart
        label={t('history.scores')}
        points={chartPoints(historyOf(reports, lastWeek, scoreOf))}
        formatValue={(value) => t('history.score', { value })}
        missingLabel={missingLabel}
      />
      {weights.some(({ value }) => value !== null) ? (
        <TrendChart
          label={t('history.weight')}
          points={chartPoints(weights)}
          formatValue={(value) => t('history.kg', { value })}
          missingLabel={missingLabel}
        />
      ) : (
        <p>{t('history.weightHidden')}</p>
      )}
    </>
  );
}

/** F3-FR-08 F3-FR-09: a friend's last 12 weeks, and removing them after a confirmation. */
export function FriendDialog({ db, friend, lastWeek, onClose, onRemoved }: FriendDialogProps) {
  const { t } = useTranslation('friends');
  const reports = useReportsOf(db, friend?.userId);
  const [confirming, setConfirming] = useState(false);
  const nickname = friend?.nickname ?? '';
  const remove = async () => {
    if (friend) await removeFriend(db, friend.userId);
    setConfirming(false);
    await onRemoved();
  };

  return (
    <Modal
      opened={friend !== undefined}
      onClose={onClose}
      title={nickname}
      closeLabel={t('close')}
      size="medium"
    >
      <Stack>
        <FriendHistory reports={reports} lastWeek={lastWeek} />
        <div>
          <Button variant="destructive" onClick={() => setConfirming(true)}>
            {t('remove.open', { nickname })}
          </Button>
        </div>
      </Stack>
      <ConfirmDialog
        opened={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => void remove()}
        title={t('remove.title', { nickname })}
        message={t('remove.message', { nickname })}
        confirmLabel={t('remove.confirm')}
        cancelLabel={t('remove.cancel')}
        closeLabel={t('close')}
        destructive
      />
    </Modal>
  );
}
