import { exportPublicKey, importPublicKey, verifyText } from '../crypto';
import { buildSignedContent, type WeekReportInput } from './build';
import { decodeReport, encodeSignedReport, type DecodeError } from './encoding';
import type { ReportSummary } from './summary';
import { parseSignedContent } from './validation';

export type ReportReadError = DecodeError | 'invalidContent' | 'invalidSignature';

export type ReportReadResult =
  { ok: true; summary: ReportSummary } | { ok: false; error: ReportReadError };

/** RF-10, RF-28: the week's summary, signed, ready to be drawn as a QR code. */
export async function createReport(
  input: WeekReportInput,
  keys: CryptoKeyPair,
): Promise<Uint8Array<ArrayBuffer>> {
  const content = buildSignedContent(input, await exportPublicKey(keys.publicKey));
  if (!parseSignedContent(content)) {
    throw new RangeError('This week cannot be put in a report a friend could read');
  }
  return encodeSignedReport(content, keys.privateKey);
}

async function isSignedBy(publicKey: string, text: string, signature: string): Promise<boolean> {
  try {
    return await verifyText(await importPublicKey(publicKey), text, signature);
  } catch {
    return false;
  }
}

/** RNF-05: any outcome is a result, never an exception, whatever the image held. */
export async function readReport(bytes: Uint8Array): Promise<ReportReadResult> {
  const decoded = await decodeReport(bytes);
  if (!decoded.ok) return decoded;
  const content = parseSignedContent(decoded.content);
  if (!content) return { ok: false, error: 'invalidContent' };
  if (!(await isSignedBy(content.pub, decoded.signedText, decoded.signature))) {
    return { ok: false, error: 'invalidSignature' };
  }
  return { ok: true, summary: { ...content, sig: decoded.signature } };
}
