import type { ReportSummary } from '@vitapact/core/report';
import { verdictBand } from '@vitapact/core/scoring';
import type { Group } from '@vitapact/core/storage';
import { contentKey, useTranslation } from '@vitapact/i18n';
import { Card, ChipGroup, Stack } from '@vitapact/ui';

export interface ReportPreviewProps {
  summary: ReportSummary;
  outcome: 'newFriend' | 'update' | 'replaceWeek';
  groups: readonly Group[];
  groupIds: string[];
  onGroupsChange: (groupIds: string[]) => void;
}

const weekNumberOf = (week: string) => Number(week.slice(week.indexOf('W') + 1));

function GroupChoice({ summary, groups, groupIds, onGroupsChange }: ReportPreviewProps) {
  const { t } = useTranslation('friends');
  const nickname = summary.nick;
  if (groups.length === 0) return <p>{t('addReport.noGroups', { nickname })}</p>;
  return (
    <ChipGroup
      multiple
      label={t('addReport.groups', { nickname })}
      options={groups.map(({ id, name }) => ({ value: id, label: name }))}
      value={groupIds}
      onChange={onGroupsChange}
    />
  );
}

/** F2-19 ReportPreview: whose report it is before anything is saved (F3-FR-03, F3-FR-04). */
export function ReportPreview(props: ReportPreviewProps) {
  const { t } = useTranslation('friends');
  const { summary, outcome } = props;
  const week = weekNumberOf(summary.week);
  const verdict = t(contentKey.verdictTitle(verdictBand(summary.score)));
  return (
    <Stack gap="tight">
      <Card>
        <p>{t('addReport.from', { nickname: summary.nick, week })}</p>
        <p>{t('addReport.score', { score: summary.score, verdict })}</p>
      </Card>
      {outcome === 'replaceWeek' && (
        <p>{t('addReport.replaceWeek', { nickname: summary.nick, week })}</p>
      )}
      {outcome === 'newFriend' && <p>{t('addReport.newFriend', { nickname: summary.nick })}</p>}
      {outcome === 'newFriend' && <GroupChoice {...props} />}
    </Stack>
  );
}
