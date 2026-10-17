export type CopyImageOutcome = 'copied' | 'failed';

/** Puts a PNG on the system clipboard, so it can be pasted straight into a chat. */
export type CopyImage = (png: Blob) => Promise<CopyImageOutcome>;

type ClipboardItemClass = new (items: Record<string, Blob>) => ClipboardItem;

/**
 * The web clipboard works the same in WebView2 and in the browser, so no Tauri plugin is needed.
 * A missing clipboard or a refusal (no permission, window not focused) is a failure, not an error.
 */
export function createCopyImage(
  clipboard: Pick<Clipboard, 'write'> | undefined,
  Item: ClipboardItemClass | undefined,
): CopyImage {
  return async (png) => {
    if (!clipboard || !Item) return 'failed';
    try {
      await clipboard.write([new Item({ 'image/png': png })]);
      return 'copied';
    } catch {
      return 'failed';
    }
  };
}

export const copyImage: CopyImage = (png) =>
  createCopyImage(
    globalThis.navigator?.clipboard,
    typeof ClipboardItem === 'undefined' ? undefined : ClipboardItem,
  )(png);
