import { base64UrlToBytes, bytesToBase64Url, textToBytes } from './encoding';

const KEY_ALGORITHM: EcKeyImportParams = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGNATURE_ALGORITHM: EcdsaParams = { name: 'ECDSA', hash: 'SHA-256' };
const FINGERPRINT_BYTES = 16;
const FINGERPRINT_GROUP_LENGTH = 4;

/** Where the app keeps its key pair between launches; storage passes in its own implementation. */
export interface SigningKeyStore {
  load(): Promise<CryptoKeyPair | undefined>;
  save(keys: CryptoKeyPair): Promise<void>;
}

/** The private key is created non-extractable so no export, backup or report can ever contain it. */
export function createSigningKeys(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(KEY_ALGORITHM, false, ['sign', 'verify']);
}

export async function loadOrCreateSigningKeys(store: SigningKeyStore): Promise<CryptoKeyPair> {
  const existing = await store.load();
  if (existing) return existing;
  const created = await createSigningKeys();
  await store.save(created);
  return created;
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', publicKey);
  return bytesToBase64Url(new Uint8Array(raw));
}

export function importPublicKey(exported: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', base64UrlToBytes(exported), KEY_ALGORITHM, true, [
    'verify',
  ]);
}

export async function signText(privateKey: CryptoKey, text: string): Promise<string> {
  const signature = await crypto.subtle.sign(SIGNATURE_ALGORITHM, privateKey, textToBytes(text));
  return bytesToBase64Url(new Uint8Array(signature));
}

/** A malformed signature is just an invalid one: imported reports must never crash the reader. */
export async function verifyText(
  publicKey: CryptoKey,
  text: string,
  signature: string,
): Promise<boolean> {
  try {
    const signatureBytes = base64UrlToBytes(signature);
    return await crypto.subtle.verify(
      SIGNATURE_ALGORITHM,
      publicKey,
      signatureBytes,
      textToBytes(text),
    );
  } catch {
    return false;
  }
}

/** Short enough to compare in person, read out in groups of four characters. */
export async function publicKeyFingerprint(publicKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', publicKey);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', raw));
  const hex = Array.from(digest.subarray(0, FINGERPRINT_BYTES), (byte) =>
    byte.toString(16).padStart(2, '0').toUpperCase(),
  ).join('');
  return Array.from({ length: hex.length / FINGERPRINT_GROUP_LENGTH }, (_, group) =>
    hex.slice(group * FINGERPRINT_GROUP_LENGTH, (group + 1) * FINGERPRINT_GROUP_LENGTH),
  ).join(' ');
}
