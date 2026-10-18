import type { NoteLock } from '../crypto/notes';
/** A calendar day as `YYYY-MM-DD`. */
export type IsoDate = string;
/** An ISO week as `YYYY-Www`, e.g. `2026-W41`. */
export type IsoWeek = string;
/** A moment as an ISO 8601 timestamp, always supplied by the caller. */
export type Timestamp = string;

export const PROFILE_ID = 'me';

export interface Goals {
  sleepHours: number;
  workoutsPerWeek: number;
  sunMinutes: number;
}

export interface Profile {
  id: typeof PROFILE_ID;
  userId: string;
  nickname: string;
  goals: Goals;
  theme: 'light';
  hideWeight: boolean;
  /** Kept on the device only: never exported, never put in a report. */
  signingKeys?: CryptoKeyPair;
  /** Set while the Noteboard has a password (RF-18): the salt and a sealed check, never the key. */
  noteLock?: NoteLock;
  createdAt: Timestamp;
}

export interface Group {
  id: string;
  name: string;
  /** Empty when the stake rotates. */
  stake: string;
  /** RF-25: a new stake from a fixed list every week; absent in groups saved before it existed. */
  stakeRotates?: boolean;
  memberIds: string[];
  createdAt: Timestamp;
}

export type PillarValue = number | string | boolean | null;
/** The fields one pillar recorded for a day, keyed by field name. */
export type PillarValues = Record<string, PillarValue>;

export interface DailyEntry {
  date: IsoDate;
  /** One entry per pillar id, so a new pillar adds a key and never changes the table (RF-23). */
  pillars: Record<string, PillarValues>;
  updatedAt: Timestamp;
}

export interface WeighIn {
  week: IsoWeek;
  weightKg: number;
  measuredOn: IsoDate;
  fastingConfirmed: boolean;
}

export interface Friend {
  userId: string;
  nickname: string;
  publicKey: string;
  firstSeenAt: Timestamp;
  lastReportAt: Timestamp;
}

/** The weekly summary read from a friend's QR code (requirements section 9). */
export interface ReportSummary {
  v: number;
  uid: string;
  nick: string;
  generatedOn: IsoDate;
  week: IsoWeek;
  from: IsoDate;
  to: IsoDate;
  logged: number;
  sleepAvg: number;
  sleepOk: number;
  trainDone: number;
  trainGoal: number;
  trainMin: number;
  cleanOk: number;
  sunOk: number;
  weight?: number;
  delta?: number;
  score: number;
  prevScore?: number;
  comeback: boolean;
  pub: string;
  sig: string;
}

export interface FriendReport {
  userId: string;
  week: IsoWeek;
  summary: ReportSummary;
  importedAt: Timestamp;
}
