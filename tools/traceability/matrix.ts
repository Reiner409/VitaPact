export interface MatrixEntry {
  id: string;
  tasks: string[];
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** True when a describe/it/test title in the source mentions the requirement id, e.g. describe('RF-03 ...'). */
export function sourceCoversRequirement(source: string, id: string): boolean {
  const title = new RegExp(
    `\\b(describe|it|test)(\\.each\\([\\s\\S]*?\\))?\\(\\s*['"\`][^'"\`\\n]*(?<![\\w-])${escapeRegExp(id)}(?![\\w-]|\\.\\d)`,
  );
  return title.test(source);
}

export function uncoveredRequirements(entries: MatrixEntry[], testSources: string[]): string[] {
  return entries
    .filter(({ id }) => !testSources.some((source) => sourceCoversRequirement(source, id)))
    .map(({ id }) => id);
}
