import { useEffect, useEffectEvent } from 'react';
import { pastedImage } from './pickReport';

/** Ctrl+V with a copied image starts adding a report, wherever the focus is on the screen. */
export function usePastedReport(onImage: (image: Blob | 'notAnImage') => void) {
  const onPastedImage = useEffectEvent(onImage);
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const image = pastedImage(event.clipboardData);
      if (image === undefined) return;
      event.preventDefault();
      onPastedImage(image);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);
}
