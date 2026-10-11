export type TranslationTree = { [key: string]: string | TranslationTree };
export type Resources = Record<string, Record<string, TranslationTree>>;

const LOCALE_FILE = /\/locales\/([a-z]{2}(?:-[A-Z]{2})?)\/([a-zA-Z][\w-]*)\.json$/;

export function parseLocalePath(path: string): { language: string; namespace: string } {
  const match = LOCALE_FILE.exec(path);
  if (!match) throw new Error(`Translation file must be locales/<lang>/<namespace>.json: ${path}`);
  return { language: match[1]!, namespace: match[2]! };
}

/** Builds i18next resources from `import.meta.glob` results; one namespace per file. */
export function resourcesFromModules(modules: Record<string, unknown>): Resources {
  const resources: Resources = {};
  for (const [path, content] of Object.entries(modules)) {
    const { language, namespace } = parseLocalePath(path);
    const languageResources = (resources[language] ??= {});
    if (languageResources[namespace]) {
      throw new Error(`Namespace "${namespace}" is defined twice for "${language}" (${path})`);
    }
    languageResources[namespace] = content as TranslationTree;
  }
  return resources;
}
