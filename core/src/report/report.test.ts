import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSigningKeys, exportPublicKey, signText } from '../crypto';
import { decodeReport, encodeReportContent, encodeSignedReport } from './encoding';
import {
  MAX_REPORT_BYTES,
  NICKNAME_MAX_LENGTH,
  createReport,
  readReport,
  type ReportSummary,
  type WeekReportInput,
} from '.';

const sampleWeek: WeekReportInput = {
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
  nickname: 'Rei',
  hideWeight: false,
  generatedOn: '2026-10-11',
  week: '2026-W41',
  logged: 5,
  sleepAvg: 7,
  sleepOk: 4,
  trainDone: 2,
  trainGoal: 3,
  trainMin: 110,
  cleanOk: 4,
  sunOk: 3,
  weightKg: 78.4,
  previousWeightKg: 79,
  score: 62,
  prevScore: 34,
};

const keys = await createSigningKeys();
const otherKeys = await createSigningKeys();
const publicKey = await exportPublicKey(keys.publicKey);

const ascii = (text: string) => new TextEncoder().encode(text);

function without(input: WeekReportInput, ...fields: (keyof WeekReportInput)[]): WeekReportInput {
  const copy = { ...input };
  for (const field of fields) delete copy[field];
  return copy;
}

async function readSummary(input: WeekReportInput): Promise<ReportSummary> {
  const result = await readReport(await createReport(input, keys));
  if (!result.ok) throw new Error(`Report rejected: ${result.error}`);
  return result.summary;
}

const withoutSignature = (summary: ReportSummary) =>
  Object.fromEntries(Object.entries(summary).filter(([field]) => field !== 'sig'));

/** Signs any content, as a modified app could, to check the reader does not trust the signer. */
async function signedReportWith(changes: Record<string, unknown>): Promise<Uint8Array> {
  const content = withoutSignature(await readSummary(sampleWeek));
  return encodeSignedReport({ ...content, ...changes }, keys.privateKey);
}

describe('RF-10 weekly report content', () => {
  it('RF-10 reads back exactly the summary of section 9 it was built from', async () => {
    const summary = await readSummary(sampleWeek);

    expect(summary).toEqual({
      v: 1,
      uid: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
      nick: 'Rei',
      generatedOn: '2026-10-11',
      week: '2026-W41',
      from: '2026-10-05',
      to: '2026-10-11',
      logged: 5,
      sleepAvg: 7,
      sleepOk: 4,
      trainDone: 2,
      trainGoal: 3,
      trainMin: 110,
      cleanOk: 4,
      sunOk: 3,
      weight: 78.4,
      delta: -0.6,
      score: 62,
      prevScore: 34,
      comeback: true,
      pub: publicKey,
      sig: expect.any(String),
    });
  });

  it('RF-10 starts with the VPACT1. prefix and stays about 400 bytes', async () => {
    const report = await createReport(sampleWeek, keys);

    expect(new TextDecoder().decode(report.subarray(0, 7))).toBe('VPACT1.');
    expect(report.length).toBeLessThanOrEqual(400);
  });

  it('RF-10 rounds averages and weights to one decimal place', async () => {
    const summary = await readSummary({
      ...sampleWeek,
      sleepAvg: 7.0666,
      weightKg: 78.45,
      previousWeightKg: 79.12,
    });

    expect(summary).toMatchObject({ sleepAvg: 7.1, weight: 78.5, delta: -0.7 });
  });

  it('RF-10 leaves out the weight and the change when there was no weigh-in', async () => {
    const summary = await readSummary(without(sampleWeek, 'weightKg'));

    expect(summary).not.toHaveProperty('weight');
    expect(summary).not.toHaveProperty('delta');
  });

  it('RF-10 leaves out the change and the previous score when last week is unknown', async () => {
    const summary = await readSummary(without(sampleWeek, 'previousWeightKg', 'prevScore'));

    expect(summary).toMatchObject({ weight: 78.4, comeback: false });
    expect(summary).not.toHaveProperty('delta');
    expect(summary).not.toHaveProperty('prevScore');
  });

  it('RF-10 refuses to build a report a friend could not read', async () => {
    await expect(createReport({ ...sampleWeek, logged: 8 }, keys)).rejects.toThrow(RangeError);
    await expect(createReport({ ...sampleWeek, nickname: '  ' }, keys)).rejects.toThrow(RangeError);
  });

  it('RF-10 keeps the largest possible report within the QR content limit', async () => {
    const incompressibleNickname = Array.from({ length: NICKNAME_MAX_LENGTH }, (_, index) =>
      String.fromCodePoint(0x10000 + index * 0xb111),
    ).join('');
    const largest: WeekReportInput = {
      ...sampleWeek,
      userId: 'f9e8d7c6-b5a4-4392-8170-6f5e4d3c2b1a',
      nickname: incompressibleNickname,
      generatedOn: '2027-01-03',
      week: '2026-W53',
      logged: 7,
      sleepAvg: 23.7,
      sleepOk: 7,
      trainDone: 7,
      trainGoal: 7,
      trainMin: 10080,
      cleanOk: 7,
      sunOk: 7,
      weightKg: 20.1,
      previousWeightKg: 399.9,
      score: 100,
      prevScore: 0,
    };

    const report = await createReport(largest, keys);

    expect(report.length).toBeGreaterThan(480);
    expect(report.length).toBeLessThanOrEqual(MAX_REPORT_BYTES);
    await expect(readReport(report)).resolves.toMatchObject({
      ok: true,
      summary: { nick: incompressibleNickname, delta: -379.8 },
    });
  });

  it('RF-10 reads back a week that crosses the turn of the year', async () => {
    const summary = await readSummary({
      ...sampleWeek,
      week: '2026-W53',
      generatedOn: '2027-01-03',
    });

    expect(summary).toMatchObject({ week: '2026-W53', from: '2026-12-28', to: '2027-01-03' });
  });
});

describe('RF-27 comeback mark in the report', () => {
  it.each([
    [34, 62, true],
    [50, 70, false],
    [40, 54, false],
    [49, 64, true],
  ])('RF-27 previous week %i and this week %i give comeback %s', async (prev, score, comeback) => {
    const summary = await readSummary({ ...sampleWeek, prevScore: prev, score });

    expect(summary.comeback).toBe(comeback);
  });

  it('RF-27 rejects a report whose comeback mark contradicts its scores', async () => {
    const report = await signedReportWith({ score: 40, prevScore: 34, comeback: true });

    await expect(readReport(report)).resolves.toEqual({ ok: false, error: 'invalidContent' });
  });
});

describe('D11 hidden weight', () => {
  it('D11 leaves out the absolute weight but keeps the change when the user hides it', async () => {
    const summary = await readSummary({ ...sampleWeek, hideWeight: true });

    expect(summary).not.toHaveProperty('weight');
    expect(summary.delta).toBe(-0.6);
  });

  it('D11 never writes the hidden weight anywhere in the report', async () => {
    const report = await createReport({ ...sampleWeek, weightKg: 123.4, hideWeight: true }, keys);
    const decoded = await decodeReport(report);

    expect(decoded).toMatchObject({ ok: true });
    expect(decoded.ok && decoded.signedText).not.toContain('123.4');
  });
});

describe('RF-28 signed report', () => {
  it('RF-28 rejects a report whose content changed after signing', async () => {
    const summary = await readSummary(sampleWeek);
    const changed = JSON.stringify({ ...withoutSignature(summary), score: 90 });
    const result = await readReport(await encodeReportContent(changed, summary.sig));

    expect(result).toEqual({ ok: false, error: 'invalidSignature' });
  });

  it('RF-28 rejects a report signed by a key other than the one it carries', async () => {
    const otherPublicKey = await exportPublicKey(otherKeys.publicKey);
    const report = await signedReportWith({ pub: otherPublicKey });

    await expect(readReport(report)).resolves.toEqual({ ok: false, error: 'invalidSignature' });
  });
});

describe('RNF-05 safe report import', () => {
  it.each<[string, Record<string, unknown>]>([
    ['logged above 7', { logged: 8 }],
    ['a negative count', { sunOk: -1 }],
    ['a fractional count', { cleanOk: 2.5 }],
    ['more days on target than days logged', { sleepOk: 6 }],
    ['sleep above 24 hours', { sleepAvg: 24.5 }],
    ['a training goal of zero', { trainGoal: 0 }],
    ['more training minutes than the week has', { trainMin: 10081 }],
    ['a weight below the weigh-in limit', { weight: 19.9 }],
    ['a weight above the weigh-in limit', { weight: 400.1 }],
    ['a weight with two decimals', { weight: 78.45 }],
    ['a score above 100', { score: 101 }],
    ['a score as text', { score: '62' }],
    ['a week that does not exist', { week: '2026-W54' }],
    [
      'a week 53 the year does not have',
      { week: '2027-W53', from: '2027-12-27', to: '2028-01-02' },
    ],
    ['a period that does not match the week', { from: '2026-10-04' }],
    ['a date that does not exist', { generatedOn: '2026-02-30' }],
    ['a report generated before its week', { generatedOn: '2026-10-04' }],
    ['a user id that is not a UUID', { uid: 'rei' }],
    ['an empty nickname', { nick: '   ' }],
    ['a nickname longer than the limit', { nick: 'x'.repeat(NICKNAME_MAX_LENGTH + 1) }],
    ['a nickname with a control character', { nick: 'Rei\u0007' }],
    ['a nickname with a lone surrogate', { nick: 'Rei\ud83c' }],
    ['a missing field', { trainMin: undefined }],
    ['an unknown field', { notes: 'from the psychologist' }],
    ['a comeback that is not a boolean', { comeback: 'yes' }],
    ['a public key that is not base64url', { pub: 'not a key!' }],
  ])('RNF-05 rejects %s', async (_case, changes) => {
    const report = await signedReportWith(changes);

    await expect(readReport(report)).resolves.toEqual({ ok: false, error: 'invalidContent' });
  });

  it('RNF-05 keeps a nickname with HTML as plain text, untouched', async () => {
    const nickname = '<img src=x onerror=y>';
    const summary = await readSummary({ ...sampleWeek, nickname });

    expect(summary.nick).toBe(nickname);
  });

  it('RNF-05 accepts accented letters and emoji up to the nickname limit', async () => {
    const nickname = `Élodie 🌞${'é'.repeat(NICKNAME_MAX_LENGTH - 8)}`;
    const summary = await readSummary({ ...sampleWeek, nickname });

    expect([...nickname]).toHaveLength(NICKNAME_MAX_LENGTH);
    expect(summary.nick).toBe(nickname);
  });

  it.each(['__proto__', 'constructor'])(
    'RNF-05 rejects signed content with a "%s" key',
    async (key) => {
      const content = withoutSignature(await readSummary(sampleWeek));
      const signedText = JSON.stringify(content).replace(/}$/, `,"${key}":{"score":1}}`);
      const report = await encodeReportContent(
        signedText,
        await signText(keys.privateKey, signedText),
      );

      await expect(readReport(report)).resolves.toEqual({ ok: false, error: 'invalidContent' });
    },
  );

  it('RNF-05 rejects content with a different prefix', async () => {
    const report = await createReport(sampleWeek, keys);
    report.set(ascii('XPACT1.'));

    await expect(readReport(report)).resolves.toEqual({ ok: false, error: 'notAReport' });
    await expect(readReport(ascii('VPACT01.'))).resolves.toEqual({
      ok: false,
      error: 'notAReport',
    });
    await expect(readReport(ascii('https://example.com'))).resolves.toEqual({
      ok: false,
      error: 'notAReport',
    });
  });

  it('RNF-05 asks to update the app for a report from a future version', async () => {
    const report = await createReport(sampleWeek, keys);
    report.set(ascii('VPACT2.'));

    await expect(readReport(report)).resolves.toEqual({ ok: false, error: 'futureVersion' });
  });

  it('RNF-05 rejects damaged content after a valid prefix', async () => {
    const result = await readReport(new Uint8Array([...ascii('VPACT1.'), 1, 2, 3, 4]));

    expect(result).toEqual({ ok: false, error: 'damaged' });
  });

  it('RNF-05 rejects content larger than a report can be', async () => {
    const oversized = new Uint8Array(MAX_REPORT_BYTES + 1);
    oversized.set(ascii('VPACT1.'));

    await expect(readReport(oversized)).resolves.toEqual({ ok: false, error: 'damaged' });
  });
});

describe('RNF-02 notes never reach the report', () => {
  const reportFolder = path.dirname(fileURLToPath(import.meta.url));
  const importsOf = (file: string) =>
    [
      ...readFileSync(path.join(reportFolder, file), 'utf8').matchAll(
        /(?:from|import)\s*\(?\s*'([^']+)'/g,
      ),
    ].map(([, specifier]) => specifier ?? '');

  it('RNF-02 no report file imports storage or anything named notes', () => {
    const sourceFiles = readdirSync(reportFolder).filter(
      (file) => file.endsWith('.ts') && !file.endsWith('.test.ts'),
    );
    const imports = sourceFiles.flatMap(importsOf);

    expect(sourceFiles.length).toBeGreaterThan(0);
    expect(imports.filter((specifier) => /storage|notes/i.test(specifier))).toEqual([]);
  });

  it('RNF-02 the report holds no daily data and no notes', async () => {
    const summary = await readSummary(sampleWeek);

    expect(Object.keys(summary).filter((field) => /note|day|entr/i.test(field))).toEqual([]);
  });
});
