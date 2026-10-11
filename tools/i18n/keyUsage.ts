export interface KeyUsage {
  namespace: string | undefined;
  key: string;
  file: string;
}

type Tree = { [key: string]: unknown };

const NAMESPACE_DECLARATION = /useTranslation\(\s*['"]([\w-]+)['"]/;
const TRANSLATE_CALL = /(?<![\w.])t\(\s*['"]([^'"]+)['"]/g;

export function extractKeyUsages(source: string, file: string): KeyUsage[] {
  const fileNamespace = NAMESPACE_DECLARATION.exec(source)?.[1];
  return [...source.matchAll(TRANSLATE_CALL)].map(([, fullKey]) => {
    const [prefix, ...rest] = fullKey!.split(':');
    return rest.length > 0
      ? { namespace: prefix, key: rest.join(':'), file }
      : { namespace: fileNamespace, key: fullKey!, file };
  });
}

function hasKey(tree: Tree | undefined, key: string): boolean {
  let node: unknown = tree;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null || !(part in node)) return false;
    node = (node as Tree)[part];
  }
  return typeof node === 'string';
}

export function findMissingKeys(usages: KeyUsage[], resources: Record<string, Tree>): KeyUsage[] {
  return usages.filter(({ namespace, key }) => !namespace || !hasKey(resources[namespace], key));
}
