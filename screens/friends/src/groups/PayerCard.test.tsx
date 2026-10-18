import { screen } from '@testing-library/react';
import { sampleFriend, sampleGroup } from '@vitapact/core/storage/testing';
import content from '@vitapact/i18n/locales/en/content.json';
import { renderWithProviders } from '@vitapact/ui/testing';
import { weeklyStakeIndex } from '@vitapact/core/groups';
import type { Group } from '@vitapact/core/storage';
import { describe, expect, it } from 'vitest';
import en from '../../locales/en/friends.json';
import type { FriendsData } from './groupStore';
import { PayerCard } from './PayerCard';

const own = '00000000-0000-4000-8000-000000000000';
const report = (uid: string, nick: string, score: number) => ({
  uid,
  nick,
  week: '2026-W41',
  score,
  logged: 7,
});
const group = { ...sampleGroup, stake: 'the pizza', memberIds: [sampleFriend.userId] };

function renderCard(reports: FriendsData['reports'], shown: Group = group) {
  const data: FriendsData = {
    groups: [group],
    friends: [sampleFriend],
    reports,
    ownUserId: own,
    ownNickname: 'Rei',
    rankingWeek: '2026-W41',
  };
  renderWithProviders(<PayerCard group={shown} data={data} />, {
    translations: { friends: en, content },
  });
}

const phraseText = () => screen.getByRole('region', { name: en.payer.title }).textContent ?? '';
const fill = (phrase: string, name: string) =>
  phrase.replaceAll('{{name}}', name).replaceAll('{{stake}}', 'the pizza');

describe('F3-FR-07 RF-26 the weekend card', () => {
  it('tells friends who pays, with the group stake in the phrase', () => {
    renderCard([report(own, 'Rei', 80), report(sampleFriend.userId, sampleFriend.nickname, 40)]);
    const text = phraseText();
    const friendsPhrases = Object.values(content.weekend.friends).map((phrase) =>
      fill(phrase, sampleFriend.nickname),
    );
    expect(friendsPhrases.some((phrase) => text.includes(phrase))).toBe(true);
    expect(text).not.toContain('{{');
  });

  it('shows the warmer version to the person who pays', () => {
    renderCard([report(own, 'Rei', 40), report(sampleFriend.userId, sampleFriend.nickname, 80)]);
    const payerPhrases = Object.values(content.weekend.payer).map((phrase) => fill(phrase, 'Rei'));
    expect(payerPhrases.some((phrase) => phraseText().includes(phrase))).toBe(true);
  });

  it('F3-FR-10 puts the stake of the week in the phrase when the stake rotates', () => {
    const rotating = { ...group, stake: '', stakeRotates: true };
    renderCard(
      [report(own, 'Rei', 80), report(sampleFriend.userId, sampleFriend.nickname, 40)],
      rotating,
    );
    const stakes = Object.values(content.stakes);
    expect(phraseText()).toContain(stakes[weeklyStakeIndex('2026-W41', stakes.length)]);
  });

  it('shows no card when nobody pays', () => {
    renderCard([report(own, 'Rei', 60), report(sampleFriend.userId, sampleFriend.nickname, 60)]);
    expect(screen.queryByRole('region', { name: en.payer.title })).not.toBeInTheDocument();
  });

  it('never shows a forbidden word', () => {
    renderCard([report(own, 'Rei', 80), report(sampleFriend.userId, sampleFriend.nickname, 40)]);
    expect(phraseText().toLowerCase()).not.toMatch(/\b(loser|lost|failed|fault)\b/);
  });
});
