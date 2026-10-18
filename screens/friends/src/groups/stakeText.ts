import { weeklyStakeIndex } from '@vitapact/core/groups';
import type { Group } from '@vitapact/core/storage';
import type { IsoWeek } from '@vitapact/core/calendar';
import type { useTranslation } from '@vitapact/i18n';
import { contentKey, STAKE_COUNT } from '@vitapact/i18n';

type Translate = ReturnType<typeof useTranslation>['t'];

/** RF-25: the group's own stake, or the stake of `week` when it rotates. */
export const stakeOf = (t: Translate, group: Group, week: IsoWeek): string =>
  group.stakeRotates ? t(contentKey.stake(weeklyStakeIndex(week, STAKE_COUNT))) : group.stake;
