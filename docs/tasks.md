# VitaPact: development tasks

Version 0.3 · 11 October 2026 · English translation of the Italian task list · questions 11 and 12 closed, single core package (D36), data export in 1.0 (D35)

Source: [VitaPact: requirements document](requirements.md) (Italian source: [VitaPact: documento dei requisiti](https://claude.ai/code/artifact/9858c955-752a-4c09-96e1-cc9ea4d7c9dc)), draft 0.4 (sections 4-11). This list expands the T00-T22 table in section 11 into small tasks, one per feature. Each task shows in parentheses the T task of the document it belongs to, so the two lists stay aligned. No app code: only what to do, how to check it and who does it.

---

## 1. How to read the list

**Identifiers.** `F0-..` requirements, `F1-..` setup, `F2-..` core and components, `F3-<SCREEN>-..` features of a screen, `F4-..` release. The screen codes are ON (Welcome, Benvenuto), TD (Today, Oggi), WK (Week, Settimana), FR (Friends, Amici), NB (Noteboard), ST (Settings, Impostazioni).

**Fields of each task.** Agent, dependencies, requirements covered, goal, acceptance criteria, tests to write. Tasks with the same dependencies can start in parallel.

**Definition of "done" (applies to every task, not repeated).**

1. Tests written before the code and linked to the RF/RNF requirement (RNF-14).
2. All tests green in CI, lint and the boundary rule respected.
3. No visible text written in the code, only i18n keys (RNF-12).
4. Architect's review approved; if there are findings, the task goes back to cleanup with precise instructions.
5. The Architect has updated `GUIDELINES.md` with the rules that came up (even "no new rule" must be noted in the review log).

## 2. Agent roles

| Role                                       | Works in                                             | Tasks                                                        |
| ------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| **Architect / Team lead** (reviewer agent) | `GUIDELINES.md`, `CLAUDE.md`, reviewer instructions  | Sets the rules (F1-05), reviews every task, closes the gates |
| **Setup**                                  | repo root, `src-tauri`, CI                           | F1                                                           |
| **Core**                                   | `@vitapact/core` (folders `core/src/*`), `platform/` | F2-01 … F2-15, F2-21                                         |
| **UI**                                     | `shared/ui`, `shared/i18n`                           | F2-16 … F2-19                                                |
| **Content**                                | translation files                                    | F2-20 (phrases and verdicts; Rei approves)                   |
| **Screen agent** (one per screen)          | only its own `screens/<name>`                        | F3, in parallel                                              |
| **QA / Release**                           | end-to-end tests, packaging, documents               | F4                                                           |

Parallelism rule: a screen agent does not touch `shared` or `core`. If it needs a new component or function, it opens a request for the UI or Core agent, which adds it with its test (section 6.3 of the document).

## 3. Gates

| Gate   | Closes when                                                                                     | Who decides         |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------- |
| Gate 1 | F0 complete: screens described in detail, open questions closed                                 | Rei                 |
| Gate 2 | F1 complete: empty app that opens on Windows, CI and boundary rules active, guidelines approved | Architect, then Rei |
| Gate 3 | F2 complete: core and components tested (no longer blocks the screens, see 3a)                  | Architect           |
| Gate 4 | F4 complete: Windows build, 8 end-to-end scenarios green, open source publication               | Rei                 |

## 3a. Lanes (from 12 October 2026, approved by Rei)

The core (F2-01 … F2-13, F2-15, F2-21) is on `main` and counts as complete. From here the work goes
**screen by screen, in parallel**. Each lane is a thread that works on one screen, one node at a
time, and shows the result before moving on. Gate 3 no longer blocks the screens.

### Lane rules

1. **One node = one pull request = one visible result.** A node is a part of the screen you can see and
   use (a card, a dialog, a list), saving real data locally.
2. **Screenshots in every pull request.** The node's end-to-end test saves screenshots of the screen at
   1280 and 390 px, and the pull request shows them. Rei looks at them and approves before the merge,
   after the Architect's review.
3. **One open pull request per lane.** The next node starts after the previous one is merged.
4. **A lane writes only in its own `screens/<name>`** (code, tests, `locales`). It uses what is already
   in `core` and `shared/ui` without changing it.
5. **No shared logic between lanes.** If a screen needs a function that does not exist, the lane
   writes it inside its own package, even if another lane has something similar. When the Architect
   sees common parts, they are extracted into `core` or `shared/ui` in later, separate pull requests.
6. **Contact points, each with a single owner:** `app/` (start-up, navigation, the weigh-in banner on
   every screen) belongs to the **Start-up** lane; `shared/ui` (component fixes, F2-19) to the **UI**
   lane; `docs/` and the matrix to the Architect. A screen lane that needs a change there asks the
   owner and carries on with what it has.

### The lanes

| Lane                     | Writes in            | Nodes in order (one pull request each)                                                                                                                                                                                                      |
| ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Start-up** (Architect) | `app/`               | A1 open the local database and hand it to the screens; test database exported as `@vitapact/core/storage/testing`; first launch goes to Welcome when there is no profile · A2 Sunday weigh-in and its banner on every screen (F3-TD-08, 09) |
| **UI**                   | `shared/ui`          | U1 fixes seen in the 12 October screenshots · U2 F2-19                                                                                                                                                                                      |
| **Today**                | `screens/today`      | T1 header and four cards (F3-TD-01…05) · T2 save the day and score (F3-TD-06) · T3 week strip (F3-TD-07) · T4 moved to A2 · T5 evening reminder (F3-TD-10, Could)                                                                           |
| **Week**                 | `screens/week`       | W1 selector, score and pillars (F3-WK-01, 02) · W2 day tiles (F3-WK-03) · W3 day detail and edit (F3-WK-04) · W4 weight chart (F3-WK-05) · W5 generate the report with QR (F3-WK-06)                                                        |
| **Welcome**              | `screens/onboarding` | B1 nickname (F3-ON-01) · B2 goals (F3-ON-02) · B3 privacy and profile creation (F3-ON-03)                                                                                                                                                   |
| **Noteboard**            | `screens/noteboard`  | N1 list and editor (F3-NB-01) · N2 search and tags (F3-NB-02) · N3 privacy banner (F3-NB-03) · N4 password, lock, unlock, removal (F3-NB-04…06)                                                                                             |
| **Friends**              | `screens/friends`    | F1 group and empty state (F3-FR-01, 02) · F2 add a report and a new friend (F3-FR-03, 04) · F3 weekly and monthly ranking (F3-FR-05, 06) · F4 history and removing a friend (F3-FR-08, 09) · F5 weekend card (F3-FR-07, after F2-14)        |
| **Settings**             | `screens/settings`   | S1 profile (F3-ST-01) · S2 key fingerprint and about (F3-ST-03, 05) · S3 export and import data (F3-ST-06) · S4 groups (F3-ST-02) · S5 delete all data (F3-ST-04)                                                                           |

### What a screen receives (A1)

The app opens the local database once and passes every screen these props (`ScreenProps` in
`app/src/navigation/routes.ts`). A screen declares only the ones it uses:

```ts
interface ScreenProps {
  db: VitaPactDatabase; // from @vitapact/core/storage
  profile: Profile | undefined; // undefined only on the Welcome screen, before it is created
  onProfileChange: () => Promise<void>; // call after saving the profile so every screen sees it
}
```

- Without a profile the app shows only the Welcome screen, without navigation. Once the Welcome screen
  has created the profile and called `onProfileChange`, the app moves to Today.
- Screens read and write through the functions of `@vitapact/core/storage`, never through Dexie.
- Component tests open an in-memory database with `openTestDatabase()` from
  `@vitapact/core/storage/testing`, which also exports sample records (`sampleProfile`, `sampleEntry`, …).
- End-to-end tests start with a profile through `startWithProfile(page)` from `e2e/support/localData.ts`.
- Each screen lane owns `e2e/<screen>/` (for example `e2e/onboarding/nickname.spec.ts`) and saves its
  screenshots with `page.screenshot({ path: 'e2e/<screen>/screenshots/<node>-1280.png' })`, then again
  at a 390 px wide viewport. The rest of `e2e/` stays with Start-up.
- Browser APIs a screen needs (for example copying to the clipboard) arrive as props for now. Start-up
  moves them into `platform` in a later pull request, and the screen keeps the same prop.

---

## F0 · Screens and requirements

#### F0-01 · Detailed description of the screens (T00)

- **Agent:** Senior dev (requirements thread) · **Depends on:** approved palette · **Requirements:** section 5, 6
- **Goal:** design system for the light theme and a description of every screen and modal: empty states, errors, loading, key texts.
- **Acceptance criteria:** every screen lists all its states; every text has a proposed i18n key; every component mentioned exists in section 6.2.
- **Tests to write:** none (document). It becomes the source of the F3 tests.

#### F0-02 · Closing the open questions (T00)

- **Agent:** Senior dev · **Depends on:** — · **Requirements:** section 13
- **Goal:** Rei's answer to questions 11 (who pays every weekend, month as ranking only) and 12 (Mantine 9 confirmed) and to the inconsistencies in section 8 of this list.
- **Acceptance criteria:** section 13 with no empty cells; decisions recorded in section 12.
- **Tests to write:** none.
- **Status:** done. Rei answered yes to both questions (D34 who pays every weekend, D25 Mantine 9) and the inconsistencies in section 8 are fixed.

#### F0-03 · Requirements → tasks → tests matrix

- **Agent:** Architect · **Depends on:** F0-01 · **Requirements:** RNF-14
- **Goal:** a table that links every RF and RNF to the tasks in this list and to the name of the test file that verifies it.
- **Acceptance criteria:** no Must requirement without a task; no task without a requirement.
- **Tests to write:** in F1-04, a CI script checks that every ID in the matrix appears in at least one test (`describe('RF-xx ...')`).

---

## F1 · Project start

#### F1-01 · App skeleton (T01)

- **Agent:** Setup · **Depends on:** Gate 1 · **Requirements:** D2, D3, RF-24
- **Goal:** Tauri 2 + React + TypeScript + Vite; folders `screens/{onboarding,today,week,friends,noteboard,settings}`, `shared/{ui,i18n}`, a single package `@vitapact/core` with the folders `core/src/{pillars,scoring,report,storage,groups,crypto}` (D36, PR #2), `platform/`; navigation between 6 empty screens. Identifier `com.vitapact.app`.
- **Acceptance criteria:** the app opens on Windows and you can navigate between the 6 screens; no Tauri permission beyond saving and opening files; installation for the current user.
- **Tests to write:** Playwright smoke test that opens each screen from the navigation; test that the Tauri permissions file contains only the allowed ones.

#### F1-02 · Tokens and Mantine theme (T02)

- **Agent:** Setup (with UI) · **Depends on:** F1-01 · **Requirements:** section 6.1, RNF-10
- **Goal:** `shared/ui/tokens` with all the color, size, typography and motion tokens; Mantine theme "sage" with 10 shades; CSS variables generated from the same tokens; Inter and Lucide bundled in the package.
- **Acceptance criteria:** no color or size written outside `tokens`; "reduce motion" turns off the animations.
- **Tests to write:** every token in section 6.1 exists with the expected value; contrast ≥ 4.5:1 for `text`, `textMuted`, `primaryStrong` on `bg` and `surface`, and white text on `primaryStrong`; a test that fails if a file in `screens/` contains a hand-written hex value or `px`.

#### F1-03 · i18n (T03)

- **Agent:** Setup · **Depends on:** F1-01 · **Requirements:** RF-22, RNF-12
- **Goal:** i18next + react-i18next with `en.json`, namespace structure per screen.
- **Acceptance criteria:** changing language needs no code changes; adding `it.json` is just a new file.
- **Tests to write:** a scan of the keys used in the code that fails if one is missing from `en.json`; a lint rule that flags literal strings in JSX.

#### F1-04 · Tests and CI (T04)

- **Agent:** Setup · **Depends on:** F1-01 · **Requirements:** D29, RNF-01, RNF-09
- **Goal:** Vitest, Playwright, GitHub Actions on a Windows runner that on every push runs the tests and produces the per-user NSIS installer and the portable version (no MSI, Rei's choice).
- **Acceptance criteria:** artifacts downloadable from every run; installer size checked (< 15 MB).
- **Tests to write:** in Playwright, an interceptor that makes any test fail if a network request starts (RNF-01); installer size check in CI; the matrix script from F0-03.

#### F1-05 · Guidelines and reviewer agent (T05)

- **Agent:** Architect · **Depends on:** F1-01 · **Requirements:** section 11, RNF-13, D28
- **Goal:** `GUIDELINES.md` (initial rules from section 11), `CLAUDE.md`, the reviewer agent's instructions file with its checklist, a PR template with the "requirements covered" field, review log. All in English.
- **Acceptance criteria:** Rei has read and approved them.
- **Tests to write:** none; the reviewer's checklist becomes point 4 of the definition of "done".

#### F1-06 · Lint and package boundaries (T06)

- **Agent:** Setup · **Depends on:** F1-01 · **Requirements:** section 7 (architecture), D3
- **Goal:** ESLint, Prettier, an import rule: `screens/*` uses only `shared` and `core`; only `shared/ui` imports Mantine; `core/src/report` does not import the notes.
- **Acceptance criteria:** CI red with a forbidden import (gate 2).
- **Tests to write:** a fixture with a forbidden import for each rule, checked in CI.

#### F1-07 · Content Security Policy

- **Agent:** Setup · **Depends on:** F1-01 · **Requirements:** RNF-01
- **Goal:** a CSP that blocks every `connect-src`, external scripts and remote fonts.
- **Acceptance criteria:** the app cannot open any connection, not even from devtools.
- **Tests to write:** a test that reads the Tauri configuration and checks the expected CSP; an end-to-end test that a sample `fetch` is blocked.

**Gate 2.**

---

## F2 · Core and shared components

### Core (Core agent)

#### F2-01 · Dates and ISO weeks (T07)

- **Depends on:** Gate 2 · **Requirements:** section 8, RF-07, D30
- **Goal:** pure functions for ISO week (`2026-W41`), Monday and Sunday of the week, month of a week (the month of its Sunday), "days to Sunday", "is Sunday", weigh-in catch-up deadline (the following Tuesday).
- **Acceptance criteria:** no function reads the system clock directly: the date comes in as a parameter.
- **Tests to write:** weeks across the year boundary (W52/W53/W01), a week across a month boundary, daylight saving change, last day for the catch-up.

#### F2-02 · Local storage (T07)

- **Depends on:** F2-01 · **Requirements:** section 8, RNF-11
- **Goal:** Dexie with 7 tables (`profile`, `groups`, `dailyEntries`, `weighIns`, `friends`, `friendReports`, `notes`), schema version, one function per operation.
- **Acceptance criteria:** one entry per day, overwritten on a new save; a report with the same UUID and week replaces the previous one; the day's values saved per pillar.
- **Tests to write:** read and write per table (fake-indexeddb); migration from version 1 to a test version 2; an interrupted write that leaves no half-written data; saving a check-in < 100 ms (RNF-06).

#### F2-03 · Platform module (T07)

- **Depends on:** Gate 2 · **Requirements:** section 7 (mobile outlook)
- **Goal:** `platform/` with `saveFile` and `openImageFile`, Tauri implementation now, interface ready for mobile.
- **Acceptance criteria:** `core` does not import Tauri.
- **Tests to write:** tests with a fake implementation; a boundary rule that forbids Tauri outside `platform/`.

#### F2-04 · Profile and identity (T07)

- **Depends on:** F2-02 · **Requirements:** RF-01, RF-02
- **Goal:** profile creation with a UUID generated once, default goals (7.5 h, 3 workouts, 20 min), `hideWeight`.
- **Acceptance criteria:** the UUID never changes after creation.
- **Tests to write:** correct defaults; valid UUID v4; a second save of the profile keeps the UUID.

#### F2-05 · Pillars and registry (T08)

- **Depends on:** F2-02 · **Requirements:** RF-03, RF-23, D6, D7
- **Goal:** one module per pillar (sleep, training, eating, sun) with fields, validation, goal, color, icon, contribution to the score; a registry that lists them.
- **Acceptance criteria:** a test pillar (e.g. hydration) is added with a single file and one line in the registry, without touching screens or tables.
- **Tests to write:** validation of every field (hours in steps of 0.5, quality 1-5, workout type among the 6, minutes ≥ 0, eating 1-5); test pillar registered and visible in the list.

#### F2-06 · Daily and weekly score (T09)

- **Depends on:** F2-05 · **Requirements:** RF-09, D8, section 5.3
- **Goal:** 0-100 score for the week with weights from configuration (15/25/25/20/10/5) and for the day (same weights without the weigh-in, a rest day does not penalize); verdict bands from section 9.
- **Acceptance criteria:** changing the weights in the configuration file changes the result with no other changes.
- **Tests to write:** perfect week = 100; empty week = 0; examples from section 9 (score 62, 34); rest day with workout "no"; limits of each band (29/30, 49/50, 69/70, 84/85); alternative weights from a test configuration.

#### F2-07 · Weigh-in (T09)

- **Depends on:** F2-01, F2-02 · **Requirements:** RF-05, RF-06, RF-07, D9, D26
- **Goal:** the week's weigh-in status (to ask, postponed, can be caught up, done, expired), save linked to the week with `measuredOn` and `fastingConfirmed`.
- **Acceptance criteria:** a weigh-in caught up on Tuesday counts for the previous week with no late mark; after Tuesday it can no longer be caught up.
- **Tests to write:** Sunday without weigh-in → to ask; Monday and Tuesday → can be caught up; Wednesday → expired; weight with one decimal; "fasting" (a digiuno) confirmation required.

#### F2-08 · Week statistics (T09)

- **Depends on:** F2-06, F2-07 · **Requirements:** RF-08
- **Goal:** averages per pillar, days on goal, weight series over the last 12 weeks.
- **Acceptance criteria:** weeks without a weigh-in show as gaps, not as zero.
- **Tests to write:** averages with missing days; 12-week series with gaps.

#### F2-09 · Keys and signature (T10)

- **Depends on:** F2-04 · **Requirements:** RF-28, section 10.1
- **Goal:** ECDSA P-256 key pair created on first launch, non-exportable private key, sign and verify, public key fingerprint.
- **Acceptance criteria:** the private key does not appear in any exported data.
- **Tests to write:** signature verified; signature on modified data rejected; fingerprint stable for the same key and different for different keys.

#### F2-10 · VPACT1 report content (T10)

- **Depends on:** F2-08, F2-09 · **Requirements:** RF-10, RF-27, RNF-02, RNF-05, D11
- **Goal:** building the summary (fields from section 9, `comeback` included), compression, signature, `VPACT1.` prefix; reading with validation of every field by type and limits.
- **Acceptance criteria:** about 400 characters; absolute weight left out if `hideWeight`; no daily data and no notes.
- **Tests to write:** round trip identical; out-of-range field rejected; different prefix rejected; `VPACT2.` → "update the app" (aggiorna l'app) error; nickname with HTML treated as text; test that `core/src/report` has no access to the `notes` table (RNF-02); maximum content size.

#### F2-11 · QR and PNG image (T10)

- **Depends on:** F2-10, F2-03 · **Requirements:** RF-10, RF-11, RF-12, D10, D23
- **Goal:** QR generation (qrcode), 1080 × 1350 image with nickname, week, score, verdict, 4 indicators, weight, QR, plain text under the QR (nickname, UUID, period) and the motto at the bottom; reading the QR from PNG or JPG (jsQR).
- **Acceptance criteria:** a generated image, recompressed as JPG by a chat app, can still be read.
- **Tests to write:** generate → read → identical content; medium-quality JPG read correctly; image without a QR → clear error; snapshot of the image layout.

#### F2-12 · Importing a friend's report (T10)

- **Depends on:** F2-10, F2-11 · **Requirements:** RF-12, RF-28, section 10.1
- **Goal:** the first report from a UUID registers its public key; later ones must have the same key; your own report cannot be imported as a friend.
- **Acceptance criteria:** distinct outcomes: new friend, update, replacement of the same week, different key (rejected), invalid signature, future version, own report.
- **Tests to write:** one test for each outcome.

#### F2-13 · Groups, monthly ranking and comeback (T11)

- **Depends on:** F2-06, F2-12 · **Requirements:** RF-13, RF-14, RF-25, RF-27, D30, D31
- **Goal:** local groups with members; weekly ranking (with "You" (Tu)), monthly ranking (weekly average, a week belongs to the month of its Sunday); "Waiting" (In attesa) after 8 days without a report; comeback (rientro) (below 50 and at least +15).
- **Acceptance criteria:** everything recalculated from the reports, nothing saved.
- **Tests to write:** 34 → 62 is a comeback, 50 → 70 is not, 40 → 54 is not; a week across months; a friend in more than one group; "Waiting" on day 9 and not on day 8; a late report that changes the ranking.

#### F2-14 · Who pays and the weekend phrase (T11)

- **Depends on:** F2-13, F2-20 · **Requirements:** RF-26, section 9 and 9.1, D19
- **Goal:** choosing who pays (chi offre) (report present, excluding whoever paid the previous weekend and whoever is on a comeback, lowest score, on a tie fewer days logged, otherwise nobody); phrase index from ISO week + UUID of who pays, never the same as the previous weekend's; a "friends" version and a "who pays" version.
- **Acceptance criteria:** same reports and same members → same result and same phrase on two devices; never the same person two weekends in a row.
- **Tests to write:** the 4 rules one by one; tie resolved by days logged; everyone excluded → nobody pays; two simulated "devices" with reports imported in a different order give the same result; a 52-week sequence with no phrase repeated two weekends in a row and no same person twice in a row; substitution of `{name}` and `{stake}`.

#### F2-15 · Note encryption (T12)

- **Depends on:** F2-02 · **Requirements:** RF-18, RNF-03, RNF-04
- **Goal:** AES-GCM 256 with a key from PBKDF2 (310,000 iterations, random salt), encryption of all notes when the password is set, decryption when it is removed, key only in memory.
- **Acceptance criteria:** without the right password the text cannot be read; no key or password on disk.
- **Tests to write:** encrypt → decrypt; wrong password rejected; a different IV for every note; inspection of the database after encryption with no plain text; removing the password puts the notes back in plain text.

#### F2-21 · Data export and import (T07)

- **Depends on:** F2-02, F2-03 · **Requirements:** RF-19, D35, RNF-11
- **Goal:** in `core/src/storage`, export of all tables to a JSON file with the schema version, and an import that validates the file before writing. The user chooses the file with the system dialog already planned (`platform/`, existing dialog and fs permissions); everything stays offline.
- **Acceptance criteria:** import replaces the data only after a full validation; a damaged file or an unknown version is rejected without touching the current data; protected notes stay encrypted in the file.
- **Tests to write:** round trip (export → delete → import → identical data); file with a future version rejected; truncated JSON rejected with no change to the database; file from an earlier version migrated; encrypted notes exported with no plain text.

### Shared interface (UI agent)

#### F2-16 · Base components, part one (T13)

- **Depends on:** F1-02, F1-03 · **Requirements:** section 6.2, RNF-10, RF-29
- **Goal:** AppShell (side bar above 768 px, bottom bar below), NavItem, PageHeader, Card, Button, IconButton, Banner, Modal, ConfirmDialog (simple and double), Toast, EmptyState.
- **Acceptance criteria:** usable from the keyboard, minimum target area 44 × 44, no text inside the component.
- **Tests to write:** for each component, behavior, variants and states; automatic accessibility check (axe); AppShell at 360, 767, 768 and 1024 px; double ConfirmDialog that enables only with the exact word.

#### F2-17 · Base components, fields (T13)

- **Depends on:** F1-02, F1-03 · **Requirements:** section 6.2, RNF-10
- **Goal:** NumberField (hours 0.5, minutes 5, kg 0.1; Apple-style stepper, centred value with its unit spelled out, at most 320 px), ScaleInput, YesNoToggle, ChipGroup (single and multiple), TextField/TextArea, PasswordField, Select, Badge, FilePicker.
- **Acceptance criteria:** error under the field, announced to the screen reader.
- **Tests to write:** NumberField steps and limits; ScaleInput with keyboard arrows; FilePicker with drag and drop, non-image file, error; axe on each one.

#### F2-18 · Domain components, check-in and week (T14)

- **Depends on:** F2-16, F2-17, F2-05 · **Requirements:** section 6.2, RF-23
- **Goal:** PillarCard (fields from the pillar module), ScoreRing, VerdictLabel, DayTile, WeekStrip, PillarSummary, TrendChart, WeighInBanner, WeighInDialog.
- **Acceptance criteria:** PillarCard shows the test pillar from F2-05 with no changes; pillar colors never carry text.
- **Tests to write:** PillarCard for each pillar and for the test one; WeekStrip with today highlighted; TrendChart with gaps; WeighInDialog that does not save without the "fasting" checkbox.

#### F2-19 · Domain components, friends, notes, settings (T14)

- **Depends on:** F2-16, F2-17 · **Requirements:** section 6.2
- **Goal:** ReportPreview, ReportImport, GroupSelector, RankingList/FriendRow, PayerCard, NoteList/NoteEditor, LockScreen, KeyFingerprint.
- **Acceptance criteria:** imported nicknames and texts always shown as text (RNF-05).
- **Tests to write:** FriendRow with the "Comeback" (Rientro) badge and "+28 points" (+28 punti), with "Waiting", the "You" row; a nickname with `<script>` shown literally; LockScreen with a wrong password.

#### F2-20 · Verdicts and weekend phrases

- **Agent:** Content · **Depends on:** F1-03 · **Requirements:** RF-15, RF-26, section 9 and 9.1, D12, D13
- **Goal:** in `en.json`, about 5 messages for each of the 5 bands, 12 "friends" phrases and 6 "who pays" phrases with `{name}` and `{stake}`.
- **Acceptance criteria:** Rei approves every phrase; none mentions the score; none of the words "loser", "lost", "failed", "fault", "blame"; gender-neutral phrases.
- **Tests to write:** minimum number of phrases per group; every phrase contains the required placeholders; list of forbidden words.

**Gate 3.**

---

## F3 · Screens (one agent per screen, in parallel)

Each screen agent works only in its own package and uses only components from `shared/ui` and functions from `core`. Each feature has a small Zustand store or none. The tests for each feature are component tests (Vitest + Testing Library) plus, where stated, a Playwright end-to-end test.

### Welcome · `screens/onboarding` (T15)

Common dependencies: the lane table in section 3a.

#### F3-ON-01 · Step 1: nickname

- **Requirements:** RF-01
- **Goal:** nickname field with validation.
- **Acceptance criteria:** you cannot continue with an empty or spaces-only nickname; maximum length equal to the QR limit (F2-10).
- **Tests to write:** empty, spaces only, maximum limit, accented characters and emoji.

#### F3-ON-02 · Step 2: goals

- **Requirements:** RF-01
- **Goal:** three NumberFields prefilled with the defaults.
- **Acceptance criteria:** out-of-range values flagged under the field.
- **Tests to write:** defaults shown; a change is kept when going back one step.

#### F3-ON-03 · Step 3: privacy and acceptance

- **Requirements:** RF-01, RF-02, D23
- **Goal:** the explanation "everything stays on this PC" (tutto resta su questo PC), the motto "Join the VitalityMaxxing lifestyle", the button "Accept your VitaPact."; on confirmation it creates the profile, UUID and keys.
- **Acceptance criteria:** after accepting you land on Today; when the app is reopened the welcome does not appear again.
- **Tests to write:** profile created on confirmation; end-to-end of the complete first launch ("First launch" (Primo avvio) scenario).

### Today · `screens/today` (T16)

Common dependencies: the lane table in section 3a.

#### F3-TD-01 · Day header

- **Requirements:** section 5.2
- **Goal:** greeting with the nickname by the hour, date, ISO week, days left until Sunday.
- **Tests to write:** with an injected date, Monday → 6 days, Sunday → "today" (oggi); greeting boundaries at 5, 12, 18 and 23; no greeting without a profile.

#### F3-TD-02 · Sleep card

- **Requirements:** RF-03
- **Goal:** hours in steps of 0.5 and quality on the shared 5-face scale, asked only when hours are above 0.
- **Tests to write:** values saved in the day's entry; card green when the goal is reached.

#### F3-TD-03 · Training card

- **Requirements:** RF-03
- **Goal:** yes/no, type among 6, duration in minutes; type and duration visible only with "yes".
- **Tests to write:** "no" does not ask for type and duration; "yes" without a type shows an error.

#### F3-TD-04 · Eating card

- **Requirements:** RF-03, D6
- **Goal:** 1-5 scale with labels from "Disaster" (Disastro) to "Spotless" (Pulitissima).
- **Tests to write:** choice from the keyboard; correct label for each value.

#### F3-TD-05 · Sun card

- **Requirements:** RF-03
- **Goal:** minutes with quick buttons 10/20/30/60.
- **Tests to write:** a quick button sets the value; goal reached with the minutes from the profile.

#### F3-TD-06 · Save day and daily score

- **Requirements:** RF-03, RNF-06
- **Goal:** "Save day" (Salva giornata) button, the day's ScoreRing that follows the answers live, confirmation Toast; the day stays editable and a new save overwrites; nothing is stored before "Save day".
- **Acceptance criteria:** complete check-in in less than 30 seconds (1.0 goal).
- **Tests to write:** save and reopen with the values; end-to-end of the evening check-in ("Evening check-in" (Check-in serale) scenario).

#### F3-TD-07 · Week strip

- **Requirements:** section 5.2
- **Goal:** 7 dots, filled if logged, empty if missing.
- **Tests to write:** a week with 3 logged days.

#### F3-TD-08 · Sunday weigh-in

- **Requirements:** RF-05
- **Goal:** on Sunday, on opening, WeighInDialog opens; "Later" (Più tardi) closes it.
- **Tests to write:** opens only on Sunday and only if the weigh-in is missing; does not open again after saving.
- **Owner:** the Start-up lane (A2), with F3-TD-09: the dialog and the banner share the "Later" state and live in the shell, not in Today.

#### F3-TD-09 · Weigh-in reminder and catch-up

- **Requirements:** RF-06, RF-07, D26
- **Goal:** WeighInBanner in AppShell on all screens until Tuesday; the banner reopens the dialog.
- **Acceptance criteria:** the banner lives in AppShell, not in the single screens, so it works everywhere without imports between screens.
- **Tests to write:** banner visible Sunday, Monday, Tuesday; absent Wednesday; catch-up on Tuesday saved to the right week; end-to-end "Sunday morning" (Domenica mattina).

#### F3-TD-10 · Evening reminder (Could)

- **Requirements:** RF-21
- **Goal:** a Windows notification in the evening if the check-in is missing, can be turned off.
- **Acceptance criteria:** done only if Rei confirms the Could for 1.0; it needs one more Tauri permission, to be approved in review.
- **Tests to write:** no notification if the check-in is done or if turned off.

### Week · `screens/week` (T17)

Common dependencies: the lane table in section 3a.

#### F3-WK-01 · Week selector

- **Requirements:** RF-08
- **Goal:** forward and back arrows; forward disabled on the current week.
- **Tests to write:** navigation across the year boundary.

#### F3-WK-02 · Score and pillars

- **Requirements:** RF-08, RF-09, D24
- **Goal:** large ScoreRing with VerdictLabel at the top; a row with the 4 PillarSummary.
- **Tests to write:** correct band and verdict for test scores.

#### F3-WK-03 · Day tiles

- **Requirements:** D24, section 5.3
- **Goal:** 7 DayTiles with the day's score and a dot per band.
- **Tests to write:** a day not logged shown as empty; colors per band.

#### F3-WK-04 · Day detail and editing

- **Requirements:** RF-04
- **Goal:** clicking a day opens the values of the 4 pillars; "Edit" (Modifica) button only if the week is open.
- **Tests to write:** editing a past day of the current week; closed week read-only.

#### F3-WK-05 · Weight chart

- **Requirements:** RF-08
- **Goal:** TrendChart of the last 12 Sundays.
- **Tests to write:** weeks without a weigh-in as gaps; EmptyState with no weigh-ins.

#### F3-WK-06 · Generate report

- **Requirements:** RF-10, RF-11, D10, D11
- **Goal:** a button that opens ReportPreview; "Save image" (Salva immagine) uses `platform.saveFile`; "Copy image" (Copia immagine) puts the PNG on the clipboard.
- **Tests to write:** preview with nickname, UUID and period; weight hidden if `hideWeight`; end-to-end "Sunday evening" (Domenica sera) with the PNG saved and read back.

### Friends · `screens/friends` (T18)

Common dependencies: the lane table in section 3a.

#### F3-FR-01 · Group selector and empty state

- **Requirements:** RF-25
- **Goal:** GroupSelector; EmptyState if there are no groups or friends, with the actions "New group" (Nuovo gruppo) and "Add report" (Aggiungi resoconto).
- **Tests to write:** changing group updates the ranking and the card; empty state.

#### F3-FR-02 · New group

- **Requirements:** RF-25, D18
- **Goal:** a modal with name, stake, choice of members among the imported friends.
- **Tests to write:** name required; a friend in two groups.

#### F3-FR-03 · Add report

- **Requirements:** RF-12, RF-28, RNF-05
- **Goal:** ReportImport: pasting the image from the clipboard or choosing it, preview of who it is, confirmation; messages for each outcome of F2-12.
- **Tests to write:** one test for each outcome; end-to-end "Friend import" (Import dell'amico).

#### F3-FR-04 · New friend in groups

- **Requirements:** RF-25
- **Goal:** on a friend's first report the app asks which groups to add them to, with several groups selectable at once.
- **Tests to write:** choosing no group is allowed; the friend appears in the chosen groups.

#### F3-FR-05 · Weekly ranking

- **Requirements:** RF-13, RF-14, RF-15, RF-27
- **Goal:** RankingList with position, nickname, score, verdict, weight change; "You" row; "Comeback" badge with "+N points" (+N punti); "Waiting".
- **Tests to write:** order; "You" always present; "Waiting" with no verdict and no score; comeback highlighted.

#### F3-FR-06 · Monthly ranking

- **Requirements:** RF-26, D30
- **Goal:** average of the weekly scores of the current month for the group.
- **Tests to write:** a week across months assigned to the month of its Sunday; reset on the first of the month.

#### F3-FR-07 · Weekend card

- **Requirements:** RF-26, section 9.1
- **Goal:** PayerCard with who pays and the phrase of the week; the "who pays" version if it is the user's turn; no card if nobody pays.
- **Tests to write:** friends phrase vs personal phrase; the group's stake substituted; no forbidden word visible.

#### F3-FR-10 · Stake that rotates every week

- **Requirements:** RF-25, section 9.1
- **Goal:** in the group dialog the stake is written by the group or picked by the app every week from a fixed list; the friends screen, the weekend phrase and settings show the stake of the week.
- **Tests to write:** same week, same stake on any phone; never the same stake two weeks in a row, also across the new year; no stake text needed for a rotating group; backup keeps the choice.

#### F3-FR-08 · A friend's history

- **Requirements:** RF-13
- **Goal:** clicking a friend opens the weekly scores and the weight with TrendChart.
- **Tests to write:** history with missing weeks; weight hidden if the friend left it out.

#### F3-FR-09 · Remove friend

- **Requirements:** RF-16
- **Goal:** ConfirmDialog; removes the friend, their reports and their group memberships.
- **Tests to write:** after removal the friend does not appear in any group; importing them again starts from zero (new key registered).

### Noteboard · `screens/noteboard` (T19)

Common dependencies: the lane table in section 3a.

#### F3-NB-01 · List and editor

- **Requirements:** RF-17
- **Goal:** two columns; new note, edit, delete with confirmation; title, text, date, label.
- **Tests to write:** create, edit, delete; EmptyState with no notes; on a narrow screen one column at a time (RF-29).

#### F3-NB-02 · Search and labels

- **Requirements:** RF-17, D32
- **Goal:** search on title and text; filter by label; free labels with suggestions from those already used.
- **Tests to write:** search ignoring case and accents; suggestions; search also working with protected and unlocked notes.

#### F3-NB-03 · Privacy banner

- **Requirements:** RNF-02
- **Goal:** a fixed banner "These notes are never shared or included in the QR" (Queste note non vengono mai condivise né incluse nel QR).
- **Tests to write:** banner always visible.

#### F3-NB-04 · Set password

- **Requirements:** RF-18, RNF-04
- **Goal:** from the padlock, a password with confirmation and an explicit warning that it cannot be recovered; encrypts all notes.
- **Tests to write:** warning to be accepted; a different confirmation rejected.

#### F3-NB-05 · Lock and unlock

- **Requirements:** RF-18
- **Goal:** LockScreen on opening if protected; "Lock now" (Blocca ora) removes the key from memory.
- **Tests to write:** wrong password; after "Lock now" the notes cannot be read; end-to-end "Session with the psychologist" (Sessione dalla psicologa).

#### F3-NB-06 · Remove password

- **Requirements:** RF-18
- **Goal:** asks for the current password, decrypts the notes.
- **Tests to write:** notes readable and in plain text after removal.

### Settings · `screens/settings` (T20)

Common dependencies: the lane table in section 3a.

#### F3-ST-01 · Profile

- **Requirements:** RF-01, RF-02, D11
- **Goal:** editable nickname and goals, read-only UUID with copy, the option "hide absolute weight in the report" (nascondi peso assoluto nel resoconto).
- **Tests to write:** change saved; UUID not editable; `hideWeight` reflected in the next report.

#### F3-ST-02 · Groups

- **Requirements:** RF-25
- **Goal:** create (reuses the F3-FR-02 modal, moved to `shared/ui`), rename, delete, stake and members.
- **Tests to write:** deleting a group does not delete the friends.

#### F3-ST-03 · Key fingerprint

- **Requirements:** section 10.1
- **Goal:** KeyFingerprint with your own fingerprint, to compare in person.
- **Tests to write:** the same fingerprint shown in Settings and computed by `core`.

#### F3-ST-04 · Delete all data

- **Requirements:** RF-20
- **Goal:** destructive button with a double ConfirmDialog; after deletion you go back to the welcome.
- **Tests to write:** all 7 tables empty; keys regenerated on the next launch; cancelling deletes nothing.

#### F3-ST-05 · About

- **Requirements:** D22, D27
- **Goal:** version, GPL-3.0 license, link to the code, data folder on disk.
- **Tests to write:** version read from the package, not hand-written.

#### F3-ST-06 · Export and import data

- **Requirements:** RF-19, D35
- **Goal:** "Export data" and "Import data" buttons that use F2-21; before overwriting the current data a ConfirmDialog asks for confirmation.
- **Tests to write:** export saves the chosen file; a cancelled import changes nothing; a confirmed import reloads the data; an invalid file shows a clear error.

---

## F4 · Release

#### F4-01 · End-to-end scenarios (T21)

- **Agent:** QA · **Depends on:** all of F3 · **Requirements:** section 3, RNF-01, RNF-06
- **Goal:** the 8 scenarios from section 3 on the Windows build, with the network interceptor active; a scenario with two profiles that exchange reports and see the same "who pays".
- **Acceptance criteria:** 8 scenarios green; startup < 2 s.
- **Tests to write:** the 8 scenarios plus the two-profile one.

#### F4-02 · Accessibility and mobile

- **Agent:** QA · **Depends on:** all of F3 · **Requirements:** RNF-10, RF-29
- **Goal:** keyboard pass and axe on every screen; every screen at 360 px.
- **Tests to write:** axe with no violations per screen; screenshots at 360 and 1024 px.

#### F4-03 · Packages and documents (T22)

- **Agent:** Release · **Depends on:** F4-01, F4-02 · **Requirements:** D16, D22, D27, D28, RNF-08, RNF-09
- **Goal:** installer and portable from CI, README, LICENSE GPL-3.0, CONTRIBUTING in English, the requirements document translated into English in the repo.
- **Acceptance criteria:** installation without administrator rights on Windows 10 22H2 and 11; Rei approves the publication (gate 4).
- **Tests to write:** CI check that LICENSE is present and of the installer size.

#### F4-04 · Android APK in the release

- **Agent:** Release · **Depends on:** F4-03 · **Requirements:** RF-29, D29
- **Goal:** the release workflow builds the Windows installer, the portable and the Android APK and publishes the three files as one GitHub release, only when every build passed; iOS waits for an Apple licence.
- **Acceptance criteria:** the v0.2.0 release lists the installer, the portable and the APK.
- **Tests to write:** none beyond CI; the release run itself is the check.

---

## 4. Dependency graph in short

```
F0 ──Gate 1──> F1-01 ─┬─> F1-02 ─┐
                      ├─> F1-03 ─┼─> F2-16, F2-17 ─> F2-18, F2-19
                      ├─> F1-04  │        ↑                ↑
                      ├─> F1-05  │   F2-20 (Content)       │
                      ├─> F1-06  │                         │
                      └─> F1-07 ─┴─Gate 2─> F2-01 ─> F2-02 ─> F2-04 ─> F2-09
                                            F2-03       ├─> F2-05 ─> F2-06 ─> F2-08 ─> F2-10 ─> F2-11 ─> F2-12 ─> F2-13 ─> F2-14
                                                        ├─> F2-07
                                                        ├─> F2-15
                                                        └─> F2-21 (also after F2-03)
Gate 3 ─> ON, TD, WK, FR, NB, ST in parallel ─> F4-01, F4-02 ─> F4-03 ─Gate 4
```

Parallel lanes after Gate 2: Core (F2-01 … F2-15, F2-21), UI (F2-16 … F2-19), Content (F2-20). After Gate 3: six screen agents.

## 5. Count

| Phase     | Tasks                                     |
| --------- | ----------------------------------------- |
| F0        | 3                                         |
| F1        | 7                                         |
| F2        | 21                                        |
| F3        | 41 (ON 3, TD 10, WK 6, FR 10, NB 6, ST 6) |
| F4        | 4                                         |
| **Total** | **76**                                    |

## 6. Differences from the document's T00-T22 list

The base is still the list in section 11 of the document (23 tasks, 7 roles, 4 gates). Below is what changes.

**Split tasks** (same content, smaller):

- T07 → F2-01 dates, F2-02 storage, F2-03 platform, F2-04 profile, F2-21 export
- T09 → F2-06 score, F2-07 weigh-in, F2-08 statistics
- T10 → F2-09 signature, F2-10 VPACT1 content, F2-11 QR and PNG, F2-12 import
- T11 → F2-13 groups, month and comeback, F2-14 who pays and phrase
- T13 → F2-16 and F2-17; T14 → F2-18 and F2-19
- T15-T20 → one feature per task (F3-ON, TD, WK, FR, NB, ST)

**Added tasks:**

- F0-03 requirements → tasks → tests matrix (needed for RNF-14)
- F1-07 Content Security Policy (RNF-01 had no task of its own)
- F2-20 verdicts and weekend phrases, with a new **Content** role (section 9.1 asks for Rei's review of every phrase)
- F4-02 accessibility pass and 360 px (RNF-10, RF-29)
- F2-21 and F3-ST-06 data export and import to a file (RF-19, D35: Rei brought it forward to 1.0)

**Roles:** Content and QA (which can be the same as Release) are added to the 7 in the document.

**Changed dependencies:** T14 also depends on T08 (already the case); F2-14 depends on F2-20, because choosing the phrase needs the list of phrases.

## 7. Choices made in this draft (to be confirmed)

- **Nickname length** tied to the QR limit (F3-ON-01): the exact number is set by F2-10.
- **WeighInBanner inside AppShell** (F3-TD-09): the banner must be on all screens and screens cannot import each other, so the logic is in `core` and the banner in `shared/ui`.
- **"New group" modal in `shared/ui`**: both Friends and Settings use it.
- **"Hide weight" (nascondi peso) option** placed in the profile in Settings (F3-ST-01): the document has it in the data (section 8) but does not say on which screen.
- **Evening reminder (RF-21, Could)** as the last Today task, to be done only with confirmation.
- **Separate Content agent** for the phrases, so Rei's tone review does not block the core.

## 8. Inconsistencies found in the requirements document

All fixed in the requirements document, draft 0.4 (11 October 2026). They stay here as a record:

1. **Section 7, package table:** `screens/friends` mentions "teasing" (prese in giro) (removed by D12); `screens/settings` mentions "tone, theme, backup" (tono, tema, backup) and RF-19 (backups postponed, dark theme later); `shared/ui` lists old names (StatTile, ScoreBadge, WarningBanner, ReportCard) that differ from those in section 6.2.
2. **Section 7:** the packages `core/groups` (RF-25-27), `core/crypto` (signature and notes) and `platform/`, used in this list, are missing.
3. **Key fingerprint:** sections 5.6 and 10.1 say "4 words" (4 parole), section 6.2 (KeyFingerprint) says "groups of 4 characters" (gruppi da 4 caratteri).
4. **Section 5.3** calls the button "Generate report" (Genera resoconto), section 6.3 calls it "Create report" (Crea resoconto).
5. **Section 4** says "28 requirements" and "draft 0.3"; there are 29 RFs (RF-01 … RF-29).
6. **Section 5.0** is still "to be approved" (da approvare), but the reference model is already used in 6.3.
7. **Section 13:** questions 11 and 12 had no answer (now closed, D25 and D34).
