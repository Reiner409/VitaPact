import { describe, expect, it } from 'vitest';
import { toBytes } from './fileContents';
import { createMemoryPlatform } from './memoryPlatform';
import { describePlatformContract } from './platformContract';

describePlatformContract(() => {
  const platform = createMemoryPlatform();
  return {
    platform,
    userChoosesFile: (file) => platform.chooseNextFile(file),
    savedFiles: () =>
      Promise.resolve(
        platform.savedFiles.map(({ suggestedName, contents }) => ({
          name: suggestedName,
          bytes: toBytes(contents),
        })),
      ),
  };
});

describe('F2-03 memory platform for tests', () => {
  it('plays a user who cancels the next save, then saves again', async () => {
    const platform = createMemoryPlatform();
    const request = {
      suggestedName: 'a.png',
      contents: 'x',
      filter: { name: 'PNG', extensions: ['png'] },
    };
    platform.cancelNextSave();

    expect(await platform.saveFile(request)).toBe('cancelled');
    expect(await platform.saveFile(request)).toBe('saved');
    expect(platform.savedFiles).toEqual([request]);
  });

  it('hands out queued files in order and nothing once the queue is empty', async () => {
    const platform = createMemoryPlatform();
    const first = { name: 'a.png', bytes: new Uint8Array([1]) };
    const second = { name: 'b.png', bytes: new Uint8Array([2]) };
    platform.chooseNextFile(first);
    platform.chooseNextFile(second);

    expect((await platform.openImageFile('Images'))?.name).toBe('a.png');
    expect((await platform.openImageFile('Images'))?.name).toBe('b.png');
    expect(await platform.openImageFile('Images')).toBeUndefined();
  });
});

describe('F2-03 the in-memory platform is for tests only', () => {
  it('is exported from the testing entry point and not from the app one', async () => {
    const app: Record<string, unknown> = await import('./index');
    const testing: Record<string, unknown> = await import('./testing');
    expect(Object.hasOwn(app, 'createMemoryPlatform')).toBe(false);
    expect(testing.createMemoryPlatform).toBe(createMemoryPlatform);
  });
});
