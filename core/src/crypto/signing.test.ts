import { describe, expect, it } from 'vitest';
import {
  createSigningKeys,
  exportPublicKey,
  importPublicKey,
  loadOrCreateSigningKeys,
  publicKeyFingerprint,
  signText,
  verifyText,
  type SigningKeyStore,
} from '.';

const report = 'VPACT1.{"uid":"3f2a9c1e","score":62}';

function memoryKeyStore(): SigningKeyStore & { saves: number } {
  let stored: CryptoKeyPair | undefined;
  return {
    saves: 0,
    load: () => Promise.resolve(stored),
    save(keys) {
      stored = keys;
      this.saves += 1;
      return Promise.resolve();
    },
  };
}

describe('RF-28 signing keys', () => {
  it('RF-28 creates an ECDSA P-256 key pair whose private key cannot be exported', async () => {
    const { privateKey, publicKey } = await createSigningKeys();

    expect(privateKey.algorithm).toMatchObject({ name: 'ECDSA', namedCurve: 'P-256' });
    expect(privateKey.extractable).toBe(false);
    await expect(crypto.subtle.exportKey('pkcs8', privateKey)).rejects.toThrow();
    await expect(crypto.subtle.exportKey('jwk', privateKey)).rejects.toThrow();
    expect(publicKey.extractable).toBe(true);
  });

  it('RF-28 creates the key pair on first launch and reuses it afterwards', async () => {
    const store = memoryKeyStore();

    const first = await loadOrCreateSigningKeys(store);
    const second = await loadOrCreateSigningKeys(store);

    expect(second).toBe(first);
    expect(store.saves).toBe(1);
  });

  it('RF-28 exports only public data: the exported key round-trips and carries no private part', async () => {
    const keys = await createSigningKeys();

    const exported = await exportPublicKey(keys.publicKey);
    const imported = await importPublicKey(exported);
    const jwk = await crypto.subtle.exportKey('jwk', imported);

    expect(exported).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(jwk.d).toBeUndefined();
    expect(await exportPublicKey(imported)).toBe(exported);
  });
});

describe('RF-28 report signature', () => {
  it('RF-28 verifies a signature made with the matching private key', async () => {
    const keys = await createSigningKeys();

    const signature = await signText(keys.privateKey, report);

    expect(await verifyText(keys.publicKey, report, signature)).toBe(true);
  });

  it('RF-28 rejects a signature on modified data', async () => {
    const keys = await createSigningKeys();
    const signature = await signText(keys.privateKey, report);

    const tampered = report.replace('62', '92');

    expect(await verifyText(keys.publicKey, tampered, signature)).toBe(false);
  });

  it('RF-28 rejects a signature made by another key, as when someone pretends to be a friend', async () => {
    const friend = await createSigningKeys();
    const impostor = await createSigningKeys();

    const signature = await signText(impostor.privateKey, report);

    expect(await verifyText(friend.publicKey, report, signature)).toBe(false);
  });

  it('RF-28 rejects a malformed signature without throwing', async () => {
    const keys = await createSigningKeys();

    expect(await verifyText(keys.publicKey, report, 'not-a-signature')).toBe(false);
    expect(await verifyText(keys.publicKey, report, '')).toBe(false);
  });

  it('RF-28 verifies with a public key imported from its exported form', async () => {
    const keys = await createSigningKeys();
    const signature = await signText(keys.privateKey, report);

    const friendKey = await importPublicKey(await exportPublicKey(keys.publicKey));

    expect(await verifyText(friendKey, report, signature)).toBe(true);
  });

  it('RF-28 refuses to import a public key that is not a P-256 point', async () => {
    await expect(importPublicKey('AAAA')).rejects.toThrow();
  });
});

describe('RF-28 public key fingerprint', () => {
  it('RF-28 shows the fingerprint in groups of 4 characters', async () => {
    const { publicKey } = await createSigningKeys();

    const fingerprint = await publicKeyFingerprint(publicKey);

    expect(fingerprint).toMatch(/^[0-9A-F]{4}( [0-9A-F]{4}){7}$/);
  });

  it('RF-28 gives the same fingerprint for the same key, also after export and import', async () => {
    const { publicKey } = await createSigningKeys();
    const imported = await importPublicKey(await exportPublicKey(publicKey));

    expect(await publicKeyFingerprint(publicKey)).toBe(await publicKeyFingerprint(publicKey));
    expect(await publicKeyFingerprint(imported)).toBe(await publicKeyFingerprint(publicKey));
  });

  it('RF-28 keeps the fingerprint format fixed, so friends on other devices see the same string', async () => {
    const knownPublicKey =
      'BGLQYHERdImT20clvDbXQBA-iWEWkhem0pWzWJjJFgENvazM2QW99wytHoVuK8I5SqbkVeZ2ZiZpQ8wgv4bH5DM';

    const fingerprint = await publicKeyFingerprint(await importPublicKey(knownPublicKey));

    expect(fingerprint).toBe('4861 6A89 EA77 BDB0 A1F2 4F57 60EF A273');
  });

  it('RF-28 gives different fingerprints for different keys', async () => {
    const first = await createSigningKeys();
    const second = await createSigningKeys();

    expect(await publicKeyFingerprint(first.publicKey)).not.toBe(
      await publicKeyFingerprint(second.publicKey),
    );
  });
});
