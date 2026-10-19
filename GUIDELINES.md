# VitaPact team guidelines

The shared memory of the project. Every agent reads this file before starting a task, and the
reviewer agent adds the rules that come out of each review (requirements doc, section 11).
Rules are numbered so reviews can cite them; never renumber, retire a rule by striking it out.

## 1. How a task runs

1. **Read** this file, `CLAUDE.md` and your task in `docs/tasks.md`; the requirements are in `docs/requirements.md`.
2. **Red.** Write the tests first. Each test title names the requirement it verifies, e.g.
   `describe('RF-03 daily check-in', ...)` (RNF-14). Run them and see them fail.
3. **Green.** Write the simplest code that passes.
4. **Clean.** Clear names, short functions with one job, no duplicates.
5. **Review.** The reviewer agent checks the work against `.claude/agents/reviewer.md`. Findings
   send the task back to step 4 with precise instructions.
6. **Learn.** On approval the reviewer updates this file (or logs "no new rule") in
   `docs/reviews/LOG.md`.

A task is done only when `pnpm verify` and `pnpm test:e2e` are green and the review is approved.

## 2. Ownership and parallel work

- **G2.1** Touch only the files your task owns (task list, section 2). A screen agent works only
  in `screens/<name>/`. Core works in `core/` and `platform/`. UI works in `shared/ui` and
  `shared/i18n/src`. Contenuti owns `shared/i18n/locales`. Setup owns the repo root, `app/`, `src-tauri/`, `tools/`, `e2e/` and CI, except
  `e2e/<screen>/`, which belongs to that screen's lane (section 3a of the task list).
- **G2.2** Need something outside your package (a component, a core function, a permission)?
  Do not add it yourself: ask the owner through the coordinator. The owner adds it with its test.
- **G2.3** Each task works on its own branch `task/<id>-<short-name>` and opens a pull request on
  GitHub. The reviewer approves it and Rei merges it with "Squash and merge"; nobody pushes to
  `main` directly.

## 3. Architecture and package boundaries

Enforced by the `vitapact/package-boundaries` lint rule (`tools/boundaries/boundaries.js`).

- **G3.1** Layers, top to bottom: `app` → `screens/*` → `shared/*` and `platform` → `core`.
  A package uses only packages below it, never a sibling screen.
  So `shared/ui` may use `core` types and pure functions (a `PillarCard` takes a core `Pillar`).
  Tests that need the extra pillar from F2-05 import it from `@vitapact/core/pillars/testing`.
- **G3.2** Only `shared/ui` imports Mantine and Lucide. Screens compose `@vitapact/ui`
  components and never set their own styles.
- **G3.3** Only `shared/i18n` imports i18next. Everyone else uses `useTranslation` from
  `@vitapact/i18n`.
- **G3.4** Only `platform/` imports Tauri. `core` and `shared` never import `platform`; screens
  call platform functions and pass results down.
- **G3.5** `core` is pure TypeScript: no React, no UI, no translations, no system clock
  (dates arrive as parameters).
- **G3.6** `core` is one package with one folder per module (`core/src/<module>/`), each exposed as
  `@vitapact/core/<module>` through its `index.ts`. Modules import each other through that index
  (`../calendar`), never through deep files. `core/src/report` never reaches storage or anything
  named notes (RNF-02): it receives the week summary as input. Notes code lives in
  `storage/notes` and `crypto/notes`, never in a module's `index.ts`; the Noteboard imports it as
  `@vitapact/core/storage/notes` and `@vitapact/core/crypto/notes`.
- **G3.7** Import other packages by their `@vitapact/...` name and public entry point, never by
  a relative path or a `/src/` deep import.
- **G3.8** Each package declares its own dependencies in its `package.json` (pnpm is strict).
- **G3.9** The navigation frame (`AppShell`, `NavItem`, `PageHeader`) was created as a
  provisional version in F1-01. F2-16 owns them now and may change their look freely, but keeps
  the props used by `app/src/App.tsx`, or asks Setup to update the app in the same review.

- **G3.10** Third-party libraries have one home each: Dexie in `core/src/storage`, `qrcode` and
  `jsqr` in `core/src/report`, Chart.js in `shared/ui`. They are already declared, so a task never
  needs to edit `core/package.json`; a new library goes through the reviewer.

## 4. Visual design

- **G4.1** Every colour, size, radius, shadow and duration comes from
  `shared/ui/src/tokens/tokens.ts`. No hex code, `rgb()` or `px` value anywhere in `screens/`
  (a test fails otherwise).
- **G4.2** Pillar colours never carry text: they colour icons, bars and borders only.
- **G4.3** `color.danger` is for errors and destructive actions only, never for scores or
  verdicts.
- **G4.4** `primaryStrong` text passes AA on `bg` and `surface` only. Do not use it as text on
  `sidebar` (4.06:1) or `primarySoft` (4.24:1); use `text` there.
- **G4.5** Icons come only from `appIcons` in `shared/ui/src/icons/AppIcon.tsx`. New icons are
  chosen from Lucide and added there.
- **G4.6** Clickable targets are at least 44 × 44 px (`tokens.layout.minTouchTarget`), every
  action is keyboard reachable, nothing works only on hover.

## 5. Text and translations

- **G5.1** No visible or announced text in code: no JSX text, no string literal in JSX, no literal
  `aria-label`, `title`, `placeholder`, `alt`, `label` (lint rule, RNF-12).
- **G5.2** Every package keeps its strings in `locales/<lang>/<namespace>.json`. A screen's
  namespace is its folder name (`today`, `week`, ...). The app finds the files by itself: adding
  Italian means adding `locales/it/<namespace>.json` files, no code change.
- **G5.3** Call `useTranslation('<namespace>')` once per component file and `t('literal.key')`
  with a literal key, so `pnpm check:i18n` can verify it. For another namespace write
  `t('ns:key')`. A key built at runtime (e.g. verdict bands) must come from a typed list that a
  test checks against the English file.
- **G5.4** Interpolation uses i18next syntax: `{{name}}`, `{{stake}}`.
- **G5.5** Shared components contain no text: labels arrive as props, already translated.
- **G5.6** Weekend phrases (`shared/i18n/locales/en/content.json`) are approved by Rei word for
  word; never edit them in code reviews. Phrases may start with `{{stake}}`, so F2-14 capitalises
  the first letter of the rendered phrase (general rule, covered by a test).
- **G5.7** User-provided text (nicknames, stakes, notes, imported fields) is rendered as React
  text, never as HTML (RNF-05). `dangerouslySetInnerHTML` is forbidden.

## 6. Code style

- **G6.1** Names explain the code; comments only say _why_, never _what_ (RNF-13).
- **G6.2** Functions do one thing. Lint limits: 40 lines per function, complexity 10, depth 3,
  4 parameters.
- **G6.3** TypeScript strict mode, no `any`, no non-null assertion unless the value is provably
  present (prefer narrowing).
- **G6.4** Each screen keeps at most one small Zustand store per feature, or none.
- **G6.5** Everything in English: code, tests, docs, commit messages.
- **G6.6** Commits are authored by Rei, one per task. Work-in-progress commits on a task branch
  are fine; "Squash and merge" turns the branch into a single commit on `main`.
- **G6.7** Commit messages read like a teammate wrote them: an imperative subject (max 72
  characters) that says what the task achieved, followed by the task id, e.g.
  `Add the pillar registry with sleep, training, food and sun (F2-05)`; then a short body saying
  what changed for the app and why. No file-by-file lists ("added file X"), no tool or AI
  trailers (`Co-Authored-By`, session links, "generated with").

## 7. Tests

- **G7.1** Test titles start with or contain the requirement id (`RF-xx`, `RNF-xx`) or the task id
  for setup work. `docs/traceability-matrix.json` lists the ids; `pnpm check:matrix` fails if one
  has no test. Task branches do not edit the matrix or `pnpm-lock.yaml` conflicts by hand: list the
  covered ids in the review request; the reviewer updates the matrix and regenerates the lockfile
  with `pnpm install` when merging.
- **G7.2** Logic tests live next to the code (`*.test.ts`). Component tests use Testing Library
  and `renderWithProviders` from `@vitapact/ui/testing`, querying by role and accessible name.
- **G7.3** End-to-end tests import `test` and `expect` from `e2e/fixtures.ts`, never from
  `@playwright/test`: the fixture fails any test that makes a network request (RNF-01).
- **G7.4** Dates in tests are injected, never read from the clock.
- **G7.5** Never skip, disable or loosen a test to get green.

## 8. Security and privacy

- **G8.1** No network, ever. The CSP (`tools/security/csp.ts`) allows only Tauri IPC. Never add a
  remote origin, CDN, remote font or analytics.
- **G8.2** Tauri permissions are limited to `core:default`, opening and saving files
  (`src-tauri/capabilities/default.json`). A new permission needs Rei's approval in review.
- **G8.3** Only standard Web Crypto algorithms; secrets (private key, note key, password) never
  reach disk in readable form or any export. Storing a non-extractable `CryptoKey` in IndexedDB is
  allowed: the browser keeps it, and no code can read its bytes.

## 9. Rules learned in reviews

<!-- The reviewer appends rules here: G9.n · task id · rule. -->

- **G9.1** · F2-02 · A test title carries a requirement id only when that test checks the
  requirement. An id that is merely nearby goes in the PR body, not in the title.
- **G9.2** · F2-03 · Keys that come from outside the app (storage, imports, QR payloads) are looked
  up in a `Map`, an `Object.create(null)` record or behind `Object.hasOwn`, never on a plain object.
- **G9.3** · F1-06 · A test that starts a heavy tool (ESLint, a bundler) gives its `describe` an
  explicit timeout, because the cold start is slow on a busy machine.
- **G9.4** · F2-07 · Tests of a date rule in core include an ISO year with week 53 and the turn of
  the year.
- **G9.5** · F2-09 · Never assert the bytes of an ECDSA signature: they change on every run. Verify
  the signature instead, and check that tampering makes verification fail.
- **G9.6** · F2-16 · Every clickable element takes its size from the `touchTarget` token, and a test
  checks it.
- **G9.7** · F2-21 · Shape checks on untrusted input test field names with `Object.hasOwn` and
  reject `__proto__`, `constructor` and `prototype`. Every free-form key, string and list has a
  named length limit.
- **G9.8** · F2-01 · Calendar-day arithmetic works on UTC midnights of `YYYY-MM-DD` strings. Only
  `toCalendarDate` converts from local time, so a time-zone or daylight-saving change never shifts
  a day.
- **G9.9** · F2-10 · A size limit on generated content is set from a measured worst case built from
  incompressible input, and the producer refuses what its own reader would refuse.
- **G9.10** · F2-11 · A file the user chooses is checked before it is decoded: first its bytes, then its
  pixel dimensions. Every failure is a typed outcome, not an exception. APIs that exist only in the
  browser live in `platform`, and core receives plain bytes or pixels.
- **G9.11** · F2-18 · A component that draws the fields of a core type reads every property core uses
  for them (unit, min, max, step), and its tests use core's own fixtures.
- **G9.12** · F2-11 · A new library, even a test-only one, comes in only after a native alternative has
  been ruled out. The pull request lists the pros and cons, and Rei approves it.
- **G9.13** · F3-NB-02 · A filter whose choices come from the user's data stops applying a chosen
  value once that value is no longer among the choices, so a list never stays narrowed with no way to
  clear it.
- **G9.14** · F4-04 · A workflow starts at `permissions: contents: read` and passes a called
  workflow only the secrets it declares. Only the job that publishes gets write access.
- **G9.15** · F4-01 · An end-to-end step used by more than one spec lives once in `e2e/support/`,
  and every spec imports it instead of keeping a local copy.
- **G9.16** · F4-01 · A test of an exclusion rule sets up its data so that the excluded person would
  be chosen without the rule, and asserts the order that proves it.
- **G9.17** · F4-02 · A keyboard test presses Tab until focus comes back round, checks the focus ring
  at every stop and then checks that every visible, enabled control was reached. Tabbing until one
  target has focus is not a keyboard pass.
