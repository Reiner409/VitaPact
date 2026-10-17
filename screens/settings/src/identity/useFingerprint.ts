import { publicKeyFingerprint } from '@vitapact/core/crypto';
import { useEffect, useState } from 'react';

interface Computed {
  key: CryptoKey;
  fingerprint: string;
}

/** Undefined while it is computed, and when the device has no signing keys yet. */
export function useFingerprint(publicKey: CryptoKey | undefined): string | undefined {
  const [computed, setComputed] = useState<Computed>();
  useEffect(() => {
    if (!publicKey) return undefined;
    let current = true;
    void publicKeyFingerprint(publicKey).then(
      (fingerprint) => current && setComputed({ key: publicKey, fingerprint }),
    );
    return () => {
      current = false;
    };
  }, [publicKey]);
  // A fingerprint of an older key is never shown for a new one.
  return computed?.key === publicKey ? computed?.fingerprint : undefined;
}
