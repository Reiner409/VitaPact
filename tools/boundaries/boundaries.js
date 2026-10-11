// Package boundary rules (F1-06, requirements section 7). Plain JavaScript so ESLint can load it directly.
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const BUILD_CONFIG = /\.config\.[cm]?[jt]s$/;
const PACKAGE_ROOT = /^(app|platform|core|screens\/[^/]+|shared\/[^/]+)\//;
const CORE_MODULE = /^core\/src\/([^/]+)\//;

/**
 * @typedef {{ forbidden: RegExp, unless?: RegExp, message: string }} BoundaryRule
 * `appliesTo` and `unless` match the importing area: the package root, or `core/<module>` inside core.
 * `forbidden` matches the import specifier, or the repo path of a relative import inside the package.
 */

/** @type {Array<{ appliesTo: RegExp } & BoundaryRule>} */
export const BOUNDARY_RULES = [
  {
    appliesTo: /./,
    forbidden: /^@mantine\//,
    unless: /^shared\/ui$/,
    message: 'Only shared/ui may import Mantine; use the components exported by @vitapact/ui.',
  },
  {
    appliesTo: /./,
    forbidden: /^lucide-react$/,
    unless: /^shared\/ui$/,
    message: 'Only shared/ui may import Lucide; use <AppIcon name="..." /> from @vitapact/ui.',
  },
  {
    appliesTo: /./,
    forbidden: /^(i18next|react-i18next)$/,
    unless: /^shared\/i18n$/,
    message: 'Only shared/i18n may import i18next; use useTranslation from @vitapact/i18n.',
  },
  {
    appliesTo: /./,
    forbidden: /^@tauri-apps\//,
    unless: /^platform$/,
    message: 'Only platform/ may import Tauri; use @vitapact/platform.',
  },
  {
    appliesTo: /./,
    forbidden: /^dexie$/,
    unless: /^core\/storage$/,
    message: 'Only core/src/storage may import Dexie; use the functions it exports.',
  },
  {
    appliesTo: /./,
    forbidden: /^(qrcode|jsqr)$/,
    unless: /^core\/report$/,
    message: 'Only core/src/report may create or read QR codes.',
  },
  {
    appliesTo: /./,
    forbidden: /^chart\.js(\/|$)/,
    unless: /^shared\/ui$/,
    message: 'Only shared/ui may import Chart.js; use TrendChart from @vitapact/ui.',
  },
  {
    appliesTo: /./,
    forbidden: /^@vitapact\/[^/]+\/src(\/|$)/,
    message: 'Import a package through its public entry point, never from its src folder.',
  },
  {
    appliesTo: /^(screens|shared|core|platform)/,
    forbidden: /^@vitapact\/app$/,
    message: 'Nothing may import the app composition root.',
  },
  {
    appliesTo: /^screens\//,
    forbidden: /^@vitapact\/screen-/,
    message: 'A screen may not import another screen; move shared code to shared/ui or core.',
  },
  {
    appliesTo: /^screens\//,
    forbidden: /^dexie$/,
    message: 'Screens reach the database only through @vitapact/core/storage.',
  },
  {
    appliesTo: /^(shared|core|platform)/,
    forbidden: /^@vitapact\/screen-/,
    message: 'Lower layers may not import screens.',
  },
  {
    appliesTo: /^shared\/i18n$/,
    forbidden: /^@vitapact\/ui$/,
    message: 'shared/i18n may not depend on shared/ui.',
  },
  {
    appliesTo: /^(shared|core)/,
    forbidden: /^@vitapact\/platform$/,
    message: 'shared and core stay platform-agnostic; screens pass platform functions in.',
  },
  {
    appliesTo: /^core\//,
    forbidden: /^(react|react-dom|zustand|@vitapact\/ui|@vitapact\/i18n)(\/|$)/,
    message: 'core is pure TypeScript: no React, no UI, no translations.',
  },
  {
    appliesTo: /^platform$/,
    forbidden: /^(react|react-dom|@vitapact\/)/,
    message: 'platform/ wraps Tauri only and depends on no VitaPact package.',
  },
  {
    appliesTo: /^core\/report$/,
    forbidden: /^@vitapact\/core\/storage(\/|$)|^core\/src\/storage(\/|$)|notes/i,
    message:
      'core/report may not reach stored data or notes (RNF-02); it receives the week summary as input.',
  },
];

/** @param {string} absoluteFile */
const repoPathOf = (absoluteFile) =>
  path.relative(REPO_ROOT, absoluteFile).split(path.sep).join('/');

/** @param {string} absoluteFile */
export function packageRootOf(absoluteFile) {
  return PACKAGE_ROOT.exec(repoPathOf(absoluteFile))?.[1];
}

/**
 * The package root, or `core/<module>` for files inside the core package.
 * @param {string} absoluteFile
 */
export function areaOf(absoluteFile) {
  const coreModule = CORE_MODULE.exec(repoPathOf(absoluteFile))?.[1];
  return coreModule ? `core/${coreModule}` : packageRootOf(absoluteFile);
}

/**
 * @param {string} area
 * @param {string} target
 */
function ruleViolation(area, target) {
  const rule = BOUNDARY_RULES.find(
    ({ appliesTo, forbidden, unless }) =>
      appliesTo.test(area) && forbidden.test(target) && !unless?.test(area),
  );
  return rule?.message;
}

/**
 * Returns the reason an import is forbidden, or undefined when it is allowed.
 * @param {string} absoluteFile
 * @param {string} specifier
 */
export function boundaryViolation(absoluteFile, specifier) {
  const packageRoot = packageRootOf(absoluteFile);
  const area = areaOf(absoluteFile);
  if (!packageRoot || !area || BUILD_CONFIG.test(absoluteFile)) return undefined;
  if (!specifier.startsWith('.')) return ruleViolation(area, specifier);

  const target = repoPathOf(path.resolve(path.dirname(absoluteFile), specifier));
  return target.startsWith(`${packageRoot}/`)
    ? ruleViolation(area, target)
    : `Relative imports must stay inside ${packageRoot}; import other packages by their @vitapact name.`;
}

/** @type {import('eslint').Rule.RuleModule} */
const packageBoundariesRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce the VitaPact package boundaries (requirements section 7).' },
    schema: [],
  },
  create(context) {
    /** @param {{ source?: { value?: unknown } | null | undefined } & import('eslint').Rule.Node} node */
    const check = (node) => {
      const specifier = node.source?.value;
      if (typeof specifier !== 'string') return;
      const message = boundaryViolation(context.filename, specifier);
      if (message) context.report({ node, message: `"${specifier}": ${message}` });
    };
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    };
  },
};

export const vitapactPlugin = { rules: { 'package-boundaries': packageBoundariesRule } };
