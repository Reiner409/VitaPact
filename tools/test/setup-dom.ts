import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom does not implement these browser APIs; Mantine needs them to render.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom's Blob has no stream(); the report encoding pipes one through a CompressionStream.
if (!('stream' in Blob.prototype)) {
  Object.defineProperty(Blob.prototype, 'stream', {
    value(this: Blob) {
      return new ReadableStream<Uint8Array>({
        start: async (controller) => {
          controller.enqueue(new Uint8Array(await this.arrayBuffer()));
          controller.close();
        },
      });
    },
  });
}

// jsdom does no layout, so it has no scrolling either; the Today screen scrolls to a missing answer.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}
