import { weekendPayer } from '@vitapact/core/groups';
import type { Group } from '@vitapact/core/storage';
import { contentKey, useTranslation, WEEKEND_PHRASE_COUNTS } from '@vitapact/i18n';
import { Card } from '@vitapact/ui';
import type { FriendsData } from './groupStore';
import { stakeOf } from './stakeText';

export interface PayerCardProps {
  group: Group;
  data: FriendsData;
}

/**
 * F3-FR-07: who pays this weekend, announced with the phrase of the week (section 9.1). The
 * person who pays reads the warmer version; with nobody to pay there is no card.
 */
export function PayerCard({ group, data }: PayerCardProps) {
  const { t } = useTranslation('friends');
  const input = { memberIds: group.memberIds, ownUserId: data.ownUserId, reports: data.reports };
  const payer = weekendPayer(input, data.rankingWeek, WEEKEND_PHRASE_COUNTS);
  if (!payer) return null;
  const isYou = payer.userId === data.ownUserId;
  const name = isYou
    ? data.ownNickname
    : (data.friends.find(({ userId }) => userId === payer.userId)?.nickname ?? '');
  const phrase = isYou
    ? contentKey.weekendPayer(payer.payerPhrase)
    : contentKey.weekendFriends(payer.friendsPhrase);
  return (
    <section aria-label={t('payer.title')}>
      <Card tone="soft">
        <h2>{t('payer.title')}</h2>
        <p>{t(phrase, { name, stake: stakeOf(t, group, data.rankingWeek) })}</p>
      </Card>
    </section>
  );
}
