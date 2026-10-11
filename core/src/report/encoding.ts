import { signText } from '../crypto';

/** What a QR code holds: `VPACT1.` then the compressed content and signature (section 9). */
const PREFIX = /^VPACT(\d{1,3})\./;
const PREFIX_SEARCH_LENGTH = 12;
const CONTENT_VERSION = 1;
const SIGNATURE_SEPARATOR = '\n';

/** A report never comes near this; anything larger is not one, and is not unpacked. */
export const MAX_REPORT_BYTES = 512;
const MAX_CONTENT_BYTES = 4 * MAX_REPORT_BYTES;

export type DecodeError = 'notAReport' | 'futureVersion' | 'damaged';

export type DecodedReport =
  | { ok: true; content: unknown; signedText: string; signature: string }
  | { ok: false; error: DecodeError };

const ascii = (text: string) => new TextEncoder().encode(text);

async function deflate(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const compressed = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(compressed).arrayBuffer());
}

function concatenate(chunks: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
  const joined = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.length, 0));
  chunks.reduce((offset, chunk) => (joined.set(chunk, offset), offset + chunk.length), 0);
  return joined;
}

/** Stops as soon as the content outgrows a report, so a crafted image cannot exhaust memory. */
async function inflate(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array | undefined> {
  const reader = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))
    .getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (let read = await reader.read(); !read.done; read = await reader.read()) {
    size += read.value.length;
    if (size > MAX_CONTENT_BYTES) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(read.value);
  }
  return concatenate(chunks);
}

/** The signature covers the exact text that travels, so reading never re-serialises anything. */
export async function encodeReportContent(
  signedText: string,
  signature: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const compressed = await deflate(ascii(`${signedText}${SIGNATURE_SEPARATOR}${signature}`));
  return concatenate([ascii(`VPACT${CONTENT_VERSION}.`), compressed]);
}

export async function encodeSignedReport(
  content: object,
  privateKey: CryptoKey,
): Promise<Uint8Array<ArrayBuffer>> {
  const signedText = JSON.stringify(content);
  return encodeReportContent(signedText, await signText(privateKey, signedText));
}

function versionOf(bytes: Uint8Array): number | undefined {
  const start = new TextDecoder().decode(bytes.subarray(0, PREFIX_SEARCH_LENGTH));
  const match = PREFIX.exec(start);
  return match ? Number(match[1]) : undefined;
}

async function unpack(compressed: Uint8Array<ArrayBuffer>): Promise<DecodedReport> {
  const unpacked = await inflate(compressed);
  const text = unpacked && new TextDecoder('utf-8', { fatal: true }).decode(unpacked);
  const separator = text?.lastIndexOf(SIGNATURE_SEPARATOR) ?? -1;
  if (!text || separator < 0) return { ok: false, error: 'damaged' };
  const signedText = text.slice(0, separator);
  const content: unknown = JSON.parse(signedText);
  return { ok: true, content, signedText, signature: text.slice(separator + 1) };
}

export async function decodeReport(bytes: Uint8Array): Promise<DecodedReport> {
  const version = versionOf(bytes);
  if (version === undefined || version < CONTENT_VERSION) return { ok: false, error: 'notAReport' };
  if (version > CONTENT_VERSION) return { ok: false, error: 'futureVersion' };
  if (bytes.length > MAX_REPORT_BYTES) return { ok: false, error: 'damaged' };
  try {
    return await unpack(bytes.slice(`VPACT${CONTENT_VERSION}.`.length));
  } catch {
    return { ok: false, error: 'damaged' };
  }
}
