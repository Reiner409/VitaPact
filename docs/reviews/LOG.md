# Review log

Newest first. One entry per review, written by the reviewer agent (`.claude/agents/reviewer.md`).

## 2026-10-24 · F4-05 · claude/project-thread-c9svex · #64 · Changes requested

- Checks at 2037f8b (run by the reviewer):
  - verify ✔ (exit 0, 1315 unit tests, matrix 33/33).
  - e2e ✔ (87 passed).
  - CI on the PR: "iOS app" ✔ through the unsigned path (signed and TestFlight steps skipped,
    IPA uploaded), "Lint, types and tests" ✔. Windows and Android were still running.
- Checked and fine:
  - The awk extraction gives exactly the 1.0.0 section, and also stops at the next heading for
    0.2.0.
  - Every secret the release passes is declared under `workflow_call`, so G9.14 holds.
  - The artifact names match between `mobile.yml` and `release.yml`.
  - The unsigned build only swaps the simulator target of a16b730 for `aarch64-apple-ios` and
    `-sdk iphoneos` and adds `CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY=`. The `Payload/` zip
    is a valid layout for an IPA to sideload.
  - All 13 version fields are at 1.0.0, and the test fails when one of them differs.
- Findings:
  - `.github/workflows/mobile.yml:150,157,169` → the three signing conditions do not cover the
    same cases. A certificate without a profile, a team or an App Store key (for example while
    Rei adds the Apple secrets one at a time) skips both builds, so the upload of the artifact
    fails and the release with it. In the "Apple team" step, write `SIGNED=yes` to
    `$GITHUB_ENV` only when the certificate, the profile and the team are all present. Then use
    `env.SIGNED == 'yes'` for the signed build, `env.SIGNED != 'yes'` for the unsigned build,
    and `env.SIGNED == 'yes' && env.APP_STORE_CONNECT_KEY != ''` for TestFlight.
  - `tools/release/releaseFiles.test.ts:10,26` → both `describe` titles say `F4-03`, but these
    tests belong to F4-05. Rename them to `F4-05 D27 …` and `F4-05 …` (G9.1).
  - `.github/workflows/mobile.yml:13` → the comment still says the release reuses this job "to
    put the APK in the release". Say the APK and the IPA.
- Note for the merge: `docs/traceability-matrix.json` has no F4-05 yet (RF-29 lists F2-16,
  F4-02 and F4-04). The reviewer adds it when approving.
- PR title `Release 1.0.0 for Windows, Android and iOS (F4-05)` follows G6.7.
- New rules: none until approval.

## 2026-10-19 · F4-02 · task/F4-02-accessibility · #61 · Approved after changes

- Checks at 0c2c77d (run by the reviewer):
  - verify ✔ (exit 0).
  - `e2e/a11y/screens.spec.ts` ✔: 39 passed, run on a private port.
  - The author reports the full e2e suite green (87 passed).
- Both findings of the entry below are fixed:
  - Each screen and each dialog now has its own keyboard pass at 360 and 1024 px. It presses Tab
    until focus comes back round, checks the ring at every stop, then checks that every visible,
    enabled control was reached. The navigation test no longer calls `body.focus()`.
  - Text fields get the token ring from `.mantine-Input-input.mantine-Input-input:focus-visible`
    (specificity 0,3,0), and a unit test checks it.
- Mutation check by the reviewer: with `cssVariables.ts` from `main`, the keyboard pass fails on
  Today, Settings and three dialogs at both widths, on the NumberInput among others.
- Small, not blocking: the three `describe` blocks repeat the same `beforeEach` (reduced motion and
  the frozen clock). A single top-level `beforeEach` would do.
- Follow-up for the lane owners (G9.15, G2.2): `e2e/friends/add-report.spec.ts:111` and
  `e2e/week/sunday-evening.spec.ts:88` repeat the sideways-scroll check. When they change, move
  `horizontalOverflow` to `e2e/support/` and have all three specs import it.
- PR title is 87 characters (G6.7 allows 72). Suggested:
  `Check every screen with axe and show the keyboard focus ring (F4-02)` (68).
- Covered: RNF-10, RF-29 (added to the matrix by the reviewer).
- New rule: G9.17.

## 2026-10-19 · F4-02 · task/F4-02-accessibility · #61 · Changes requested

- Checks: verify ✔ at f1114bb. The reviewer's first `pnpm verify` had 1 unit test fail, with
  Playwright running on the same machine at the time. The rerun of `pnpm test` passed 1309/1309,
  and `check:i18n` and `check:matrix` passed. `e2e/a11y/screens.spec.ts` ✔ (21 passed, run by the
  reviewer on a private port). The author reports the full e2e suite green (65 passed).
- Checked and correct:
  - axe is injected with `page.evaluate`, so the CSP is untouched. The tags cover WCAG 2.1 A and AA,
    with colour contrast on.
  - `axe-core` was already approved for `@vitapact/ui`. Declaring it at the root is right for
    `e2e/` (G3.8, G9.12).
  - `focusClassName` replaces only the class Mantine adds to focusable controls. `theme.focusRing`
    falls back to `auto`, and only SegmentedControl and ColorSlider read it; neither is used.
  - A mouse click on a button does not match `:focus-visible`. So the only visible change is the
    token ring on keyboard focus.
  - The unit test fails on `main`, where `mantine-focus-never` is present.
  - Editing `shared/ui/src/theme/theme.ts` is outside QA's files (G2.1). It is accepted as a
    reviewer exception: the e2e check depends on it and the change is tested.
- Findings:
  - `e2e/a11y/screens.spec.ts:142-166` → the keyboard pass only ever focuses the navigation buttons.
    - In a traced run, focus went Today, Week, then straight from Week to Friends, and so on.
      `page.locator('body').focus()` (line 147) has no effect, because `body` cannot take focus, so
      each loop starts on the previous navigation button.
    - No control inside any screen or dialog gets keyboard focus or a ring check.
    - Write one test per screen and one per dialog in `DIALOGS`, at both `WIDTHS`. Each test opens
      the screen, then presses Tab until focus comes back to the first focused element, with a named
      upper bound.
    - On every Tab, assert that the focused element shows the ring. At the end, assert that every
      visible, enabled
      `button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])` was focused at
      least once.
    - Keep "reaches every screen with Enter" as its own test, and remove the `body.focus()` call.
  - `shared/ui/src/theme/theme.ts:69-71` → "shows on every control" does not hold for text-like
    fields.
    - Mantine's `.m_8fb7ebe7:focus { outline: none }` (specificity 0,2,0) beats the token
      `:focus-visible` rule (0,1,0). So `TextInput`, `NumberInput`, `PasswordInput`, `Select` and
      `Textarea` show only a border-colour change and no 2 px ring.
    - Traced on Today (the number field) and Settings (nickname and number field). The requirements
      (Layout table, Focus row) ask for the ring on every keyboard-focusable element.
    - Add a rule in `shared/ui` (`buildGlobalCss` or the theme's `Input` styles) that gives
      `.mantine-Input-input:focus-visible` the token outline, with enough specificity to win.
    - Add a unit test for it, either next to the `:focus-visible` test in `cssVariables.test.ts` or
      in `VitaPactProvider.test.tsx`. The rewritten keyboard pass then checks it end to end.
  - Optional: `horizontalOverflow` repeats `e2e/friends/add-report.spec.ts:111`. Moving it and
    `axeViolations` into `e2e/support/` would let later QA work reuse them. Leave the lane specs
    unchanged.
- Covered at merge: RNF-10, RF-29. The matrix is updated when the PR is approved.
- New rules: none yet. Decided when the PR is approved.

## 2026-10-19 · F4-01 · task/F4-01-e2e-scenarios · #60 · Approved

- Checks: verify ✔ at bcb2937 (run by the reviewer, with the matrix update); e2e ✔ at bcb2937
  (48 passed, run by the coordinator).
- Findings: all blocking findings of the entry below are fixed in bcb2937. Rei now trains on
  `GOOD_DAY` and scores 23, above Giulia's 20. The test asserts Rei first and Giulia last, and with
  `prevScore: 10` it fails at the payer check. Startup is measured with `performance.now()` after
  `waitFor`. The steps are shared in `e2e/support/scenario.ts`, the psychologist test carries
  RNF-02, the matrix was reverted, and `friendPage` uses the `viewport` fixture.
- Before merge: the PR title is 81 characters, so shorten it to 72 or fewer (G6.7), e.g.
  `Cover the comeback, private notes and two-friend swap end to end (F4-01)`.
- Follow-up for the lane owners (G2.2): drop the local copies of `createGroup`, `pasteImage`,
  `giuliaImage`, `writeNote` and the check-in steps in favour of `e2e/support/scenario.ts`.
- Covered: RF-26, RF-27, RNF-02, RNF-06 (added to the matrix by the reviewer).
- New rules: G9.15, G9.16.

## 2026-10-19 · F4-01 · task/F4-01-e2e-scenarios · #60 · Changes requested

- Checks: verify ✔ at d080218 (run by the reviewer, 1308 unit tests, matrix ✔); e2e ✔ at d080218
  (48 passed, run by the coordinator).
- Covered: scenarios 1-6 by the lane specs already on `main` (onboarding, friends/groups,
  today/evening-check-in, app/weigh-in, week/sunday-evening, friends/add-report); 7, 8, the
  two-device scenario and startup by `e2e/scenarios/`. Requirement ids once the findings are fixed:
  RF-26, RF-27, RNF-02, RNF-06 (RF-17 stays on F3-NB-01/02).
- Checked and correct: `friendPage` has its own context and storage and the same network guard
  (RNF-01); the two-device test really swaps the saved PNGs and compares ranking and payer on both
  devices; the psychologist test decodes the saved QR and would fail if any note field leaked.
- Findings:
  - `e2e/scenarios/comeback.spec.ts:27` → the test passes without the comeback rule. With one
    logged day Rei scores 15 (logging 15/7 + weigh-in 5 + sleep 25/7 + food 20/7 + sun 10/7), below
    Giulia's 20, so Rei is the lowest and pays anyway. Make Rei's week beat Giulia's: for example,
    give `DayAnswers` in `e2e/support/scenario.ts` an optional training answer and log a training
    day in this test (Rei 23 > 20). Then assert the order before the weekend card, e.g. the first
    item of "Week 42 ranking" contains "Rei". Check it by setting `prevScore: 10`
    (no comeback): Giulia must then be the payer and the test must fail.
  - `e2e/scenarios/startup.spec.ts:10-13` → flaky on a busy CI runner, and it reads the Node clock.
    `toBeVisible` polls after 0, 100, 250, 500 and 1000 ms, so an app ready after 0.9 s is only
    seen at about 1.85 s. Add the `reload()` round trip and the test fails at 2 s. `retries: 1`
    hides this, it does not fix it. Measure in the page from its own navigation start:
    `await page.reload(); await page.getByRole('button', { name: 'Save day' }).waitFor();
const readyAfterMs = await page.evaluate(() => performance.now());
expect(readyAfterMs).toBeLessThan(STARTUP_LIMIT_MS);` (`waitFor` polls at 0-500 ms steps, and
    `performance.now()` starts at navigation). Also fix line 4: the comment says the CI runner is
    slower, but the limit gives it no extra margin. Say instead that this is the web build in
    Chromium, standing in for the Windows window (RNF-06).
  - `e2e/scenarios/comeback.spec.ts:11-38,49-61` → the pixels→PNG→paste code is a third copy
    (`add-report.spec.ts:28-49`, `scenario.ts:58` `pastePng`). Move it into `e2e/support/scenario.ts`
    as `signedReportImage(input: WeekReportInput)` (signs, draws, returns the pixels) and
    `pasteReportImage(page, image)` (encodes to PNG in the page, then dispatches the paste through
    the same code as `pastePng`). The comeback spec keeps only Giulia's `WeekReportInput`.
  - `e2e/scenarios/psychologist.spec.ts:15-20` → copy of `writeNote` in
    `e2e/noteboard/notes.spec.ts:6-12`. Add `writeNote` to `e2e/support/scenario.ts` and use it.
  - `e2e/scenarios/*.spec.ts` (`SUNDAY_EVENING` lines 5/8/14, and the `emulateMedia` +
    `setFixedTime` + `startWithProfile` opening) → export `SUNDAY_EVENING` and a
    `startOnSundayEvening(page, options?)` from `e2e/support/scenario.ts`. Also add
    `openScreen(page, name)` there for the sidebar click repeated in comeback:47, psychologist:14,
    `saveWeeklyReport` and `openFriends`.
  - `e2e/scenarios/psychologist.spec.ts:8` → what this test checks is RNF-02 (notes never reach the
    report or the QR code), not RF-17 (G9.1). Put RNF-02 in the title.
  - `docs/traceability-matrix.json` → revert (G7.1: task branches do not edit the matrix). The PR body
    already lists the ids; the reviewer adds F4-01 to RF-26, RF-27, RNF-02 and RNF-06 at merge.
  - `e2e/fixtures.ts:30-33` → take `viewport` from the built-in fixture
    (`async ({ browser, baseURL, viewport }, provide)` → `newContext({ baseURL, viewport })`)
    instead of copying `1280 × 800` from `playwright.config.ts`.
- Follow-up for the lane owners (G2.2, not this PR): once the helpers live in
  `e2e/support/scenario.ts`, the friends, noteboard, week and today lanes can drop their local
  copies (`createGroup`, `pasteImage`, `giuliaImage`, `writeNote`, the check-in steps in
  `sunday-evening.spec.ts` and `evening-check-in.spec.ts`). The PR body says the steps "move"; they
  were copied, so reword it.
- Non-blocking: the scenarios run on the web build in Chromium, not the Windows build the goal
  mentions. That is fine until a Tauri driver exists, and the PR body should say so. `friendPage`
  records no trace on failure.
- New rules: none until approval (candidates: a shared e2e step lives once in `e2e/support/`, and lane
  specs import it; a test of an exclusion rule sets up the data so that the excluded person would
  be chosen without the rule).

## 2026-10-19 · F4-04 · task/release-android · #59 · Approved

- Checks: verify ✔ at 698997e (run by the reviewer); e2e ✔ at 39b365a (44 passed). 698997e
  changes only the two workflows, so the earlier e2e run still holds.
- Findings: both blocking findings of the entry below are fixed in 698997e. `release.yml` defaults
  to `contents: read` and only `publish` has `contents: write`. `mobile.yml` caps itself at
  `contents: read`. `workflow_call` declares the two optional signing secrets, and Release passes
  exactly those two. The branch name (G2.3) is left as it is, so the open PR is not disturbed.
- Covered: RF-29 (Android build shipped with the release), D29.
- New rule: G9.14.

## 2026-10-19 · F4-04 · task/release-android · #59 · Changes requested

- Checks: verify ✔, e2e ✔ (44 passed), both run by the reviewer at 39b365a.
- Checked and correct: in a called workflow `github.*` is the caller's context, so
  `vitapact-android-${{ github.sha }}` matches between `mobile.yml` and `release.yml:86`, and the
  concurrency group becomes `mobile-Release-<ref>`, apart from Mobile's own runs on `main`;
  upload/download-artifact are both v6 and share the run; `mv android/vitapact.apk` matches the
  single-artifact layout; `publish` needs both builds, so no partial release; the tag and version
  move to job outputs correctly; all versions read 0.2.0 (11 `package.json`, Cargo, lock, Tauri).
- Findings:
  - `.github/workflows/release.yml:13-14` → `contents: write` applies to all jobs, and a called
    workflow gets the caller's token, so the Android build (`pnpm install`, Gradle, third-party
    actions) now runs with a token that can write to the repository. Mobile never had that before. Set the top level to
    `permissions: { contents: read }` and give only `publish` (line 66) `permissions: { contents: write }`.
    Also add `permissions: { contents: read }` at the top of `mobile.yml`: a called workflow can
    only lower the caller's permissions, so that caps the job however it is called.
  - `.github/workflows/release.yml:20` → `secrets: inherit` hands every repository secret to the
    build. Declare the two that are used under `workflow_call:` in `mobile.yml:13`
    (`secrets: { ANDROID_KEYSTORE: { required: false }, ANDROID_KEYSTORE_PASSWORD: { required: false } }`)
    and pass exactly those from `release.yml`.
  - Non-blocking: the branch name does not follow G2.3 (`task/F4-04-release-android`). Renaming it
    on GitHub keeps the PR.
- New rules: none until approval (candidate: workflows default to `contents: read`, and only the
  job that publishes is given write access).

## 2026-10-18 · mobile (Android APK, phone layout) · #55 · Changes requested

- Checks: verify ✔ (b13bf95, run by the reviewer); e2e ✔ (run by the author).
- Findings:
  - `shared/ui/src/components/WeekStrip/WeekStrip.tsx:40` + `DayTile.tsx` (compact) → compact day
    tiles measure 41.1 × 54 px at a 360 px window (35.4 px at 320); 45.4 px only at 390. That breaks
    G4.6/G9.6 on the most common Android width. Make 7 × 44 px + gaps fit at 360 px (for example
    `padding` `sm` instead of `lg` on phones in `AppShell.tsx:39`, and `touchTarget.minWidth` on the
    compact tile), and add a test that checks the compact tile's size (G9.6).
  - Non-blocking: `SaveDay.tsx:20-23` scrolls again only when `notice` changes, so a second tap on
    Save within the 4 s toast does not scroll. `platformContract.ts:98,128`: the titles still talk
    about extensions now that the type comes from the bytes (G9.1).
- New rules: none until approval.

## 2026-10-18 · F3-FR-10 · #58 · Changes requested

- Checks: verify ✔, e2e ✔ (run by the author, branch at 75c3da2).
- Findings:
  - `screens/settings/src/groups/GroupsCard.tsx:23-25` → the task goal asks Settings to show the stake
    of the week; it shows only "a new one every week". Give `SettingsScreen` an injected
    `today?: CalendarDate` (as `FriendsScreen` does) and render the stake of the ranking week, or have
    Rei narrow the goal in `docs/tasks.md` and fix the PR body, which claims it is done.
  - `screens/friends/src/groups/stakeText.ts:1-11` and `screens/friends/src/ranking/ownReports.ts:29` →
    Settings needs both, so do not copy them: move `rankingWeekOf` to `core/src/groups` (with its test)
    and `stakeOf` to `shared/ui` (which already depends on core and i18n); both screens import them.
  - `core/src/groups/stake.test.ts:5-7` → the test compares a call with itself and cannot fail. Pin the
    value: `expect(weeklyStakeIndex('2026-W42', 8)).toBe(1)` (145 weeks after 2024-01-01).
  - `shared/i18n/locales/en/content.json` `stakes` → content lane text: record Rei's word-for-word
    approval of the eight stakes in the PR body, as for the weekend phrases (G5.6).
- New rules: none yet (decide at approval).

## 2026-10-17 · F3-ST-03, F3-ST-05, F3-ST-06 · #43 · Approved

- Checks: verify ✔, e2e ✔. One fix before approval: the import e2e test now checks the restored nickname
  instead of "not the changed one" (G7.5).
- Covered: RF-19 (settings part), section 10.1 fingerprint, D22, D27. Follow-ups: `KeyFingerprint` and a
  key-value list in `shared/ui`; ST-02 and ST-04 wait on the shared group dialog and `deleteAllData`.
- New rules: none.

## 2026-10-17 · F3-NB-02, F3-NB-03 · #44 · Approved after changes

- Checks: verify ✔ (1079 tests), e2e ✔ (30 tests on e3963d2; the fix commit 2a7b2c0 changes only
  `NoteList.tsx` and a unit test, verify rerun ✔).
- Covered: RF-17 (search, tag filter, tag suggestions, D32), RNF-02 (privacy banner on the list and
  the editor).
- Required and done: `NoteList.tsx` → stop applying a tag filter once no note has that tag, or the list
  stayed narrowed with no chip to clear it (test "drops the tag filter once no note has that tag any
  more"); PR body → the protected-notes search test moves to F3-NB-05; PR title shortened to 59
  characters (G6.7).
- Accepted: the e2e test clicks the tag chip by text, because Playwright cannot click Mantine's hidden
  chip input.
- New rule: G9.13.

## 2026-10-12 · F2-12 · #28 · Approved

- Checks: CI green; verify ✔, e2e ✔. Main merged in after #26, and both export sets were kept in `report/index.ts`.
- Covered: RF-12, RF-28 (core part). Each outcome in the acceptance criteria has its own test. Lookups go
  through an injected `FriendDirectory`, so report still never reaches storage (RNF-02).
- New rules: none.

## 2026-10-12 · F2-20 · #29 · Approved

- Checks: CI green.
- Covered: RF-15. Texts approved by Rei on 2026-10-12.
- Carried to the `VerdictLabel` follow-up: a test that every core `VERDICT_BANDS` id has
  `content:verdict.<band>.title` (G5.3). The i18n test copies the ids because `@vitapact/i18n` does
  not depend on core.
- New rules: none.

## 2026-10-11 · F2-11 · #26 · Approved after changes

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-10, RF-11, RF-12, D23.
- Required and done: browser-only APIs (`OffscreenCanvas`, `createImageBitmap`) moved from core to
  `platform/src/images.ts`; byte and pixel limits checked before decoding, with typed outcomes;
  `readQrCode` checks the buffer length.
- Rei's review: the test-only codecs pngjs and jpeg-js were dropped. The PNG round trip proved nothing
  because PNG is lossless. The JPG recompression test moved to `e2e/report-image.spec.ts`, which runs on
  Chromium's own codec, the engine WebView2 uses.
- New rules: G9.10, G9.12.

## 2026-10-11 · F2-18 · #25 · Approved after changes

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-03, RF-05, RF-06, RF-08, RF-09, RF-15, RF-23, RNF-10.
- Required and done: number fields take the pillar's `step` (hydration by 0.25); test pillars match
  core's; `pillarLook` uses `Object.hasOwn`; the fasting confirmation is a 44 px `Checkbox.Card` row;
  RF-07, RF-15 and RNF-05 dropped from titles that did not check them (G9.1).
- New rule: G9.11.

## 2026-10-11 · F2-10 · #23 · Approved after changes

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-10, RF-27, RF-28 (signature part), RNF-02, RNF-05, D11.
- Required and done: the worst-case report measured 517 bytes, above the 512 limit. `MAX_REPORT_BYTES`
  is now 560, taken from that measured worst case, and `createReport` throws a `RangeError` beyond it.
  Tests added for ISO week 53, the year turn and prototype keys.
- New rule: G9.9.

## 2026-10-11 · Setup · #27 · Written by the architect

- `shared/ui` may use core types and pure functions (G3.1), and `@vitapact/core/pillars/testing`
  exposes the extra pillar for tests. Two boundary cases were added.

## 2026-10-11 · F2-03 · #24 · Written by the architect

- The in-memory platform moved to `@vitapact/platform/testing`, so the app entry point no longer
  ships it. A test checks this.

## 2026-10-11 · F2-08 · #21 · Approved

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-08.
- Agreed for F2-10: the report delta is this week minus the previous ISO week's weigh-in, and it is
  left out when that week has none.
- New rules: none.

## 2026-10-11 · F2-06 · #20 · Approved after changes

- Checks: CI green; verify ✔ (363 tests), e2e ✔.
- Covered: RF-09, RF-03 (the F2-05 follow-ups). D8 in titles is justified: a test pins the weights.
- Required and done: RF-15 removed from the verdict band titles (it belongs to F2-20); the 8-day
  error is an exact `RangeError`; a direct `daysOnGoal` test for F2-08; goals and weights read through
  `Object.hasOwn`.
- The section 9 sample week did not add up to its score; the requirements were corrected (62.4 → 62).
- New rules: none (G9.1 covers the title finding).

## 2026-10-11 · F2-21 · #19 · Approved after changes

- Checks: CI green; verify ✔ (507 tests), e2e ✔.
- Covered: RF-19.
- Required and done: field names checked with `Object.hasOwn` and `__proto__`, `constructor`,
  `prototype` rejected; free-form keys limited to an identifier pattern; size, row and string limits
  as named constants; weight checked with the F2-07 limits; note dates checked by the calendar;
  version upgrades that throw return `damaged`.
- Identity: a file from another user writes nothing and returns `otherUser` unless the caller passes
  `allowOtherUser` after a second confirmation (Rei's decision D38). Signing keys are never exported.
- New rule: G9.7.

## 2026-10-11 · F2-04 · #18 · Approved after changes

- Checks: CI green; storage tests, types and lint ✔.
- Covered: RF-01, RF-02.
- Required and done: a test that the UUID survives reopening the database; goals copied field by
  field; `saveProfile` keeps the stored signing keys when the incoming profile has none.
- New rules: none.

## 2026-10-11 · F2-07 · #17 · Approved

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-05, RF-06, RF-07 (core parts).
- Requested and done: a year-end week 53 case, `isSunday`, a Saturday constant, `daysBetween` export.
- Rei set the valid weight to 20-400 kg (D37); the constants live in `core/calendar` and F2-21 reuses
  them.
- New rule: G9.4.

## 2026-10-11 · F2-17 · #14 · Approved after changes

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RNF-10.
- Required and done: select options at the touch target height; `NumberField` no longer clamps
  silently (`clampBehavior: none` plus a blur test); chip size test; border width token.
- Decision: `FilePicker` keeps the HTML file input, so no new Tauri permission is needed; the window
  sets `dragDropEnabled: false` (#16) so dropped images reach the page on Windows.
- New rule: G9.6 (shared with F2-16).

## 2026-10-11 · F2-16 · #13 · Approved after changes

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-29, RNF-10.
- Required and done: modal and toast close buttons sized from `touchTarget` with tests; toast timer
  kept in a ref; no button nested in a clickable card; font weight tokens.
- New rule: G9.6.

## 2026-10-11 · F2-03 · #9 · Approved after changes

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-10, RF-12.
- Required and done: image types looked up in a `Map` (a plain object accepted `.constructor`), with
  a contract test; RF-10 prefixes on the save tests.
- Follow-up: move `createMemoryPlatform` to a `./testing` export.
- New rule: G9.2.

## 2026-10-11 · F2-02 · #8 · Approved

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RNF-06, RNF-11, RF-23.
- Carried: RF-18 and RF-07 removed from storage test titles in F2-04; F2-21 leaves the signing keys
  out of the export.
- New rule: G9.1.

## 2026-10-11 · F2-05 · #10 · Approved

- Checks: CI green; verify ✔, e2e ✔.
- Covered: RF-03, RF-23 (not RF-01, which F2-04 covers).
- Carried to F2-06 and done there: an `unexpected` code for values a pillar did not ask for, a shared
  `reachesGoal`, exact error codes in tests.

## 2026-10-11 · F2-09 · #7 · Approved after changes

- Checks: CI green; e2e ✔.
- Covered: RF-28.
- Required and done: the fingerprint test vector was checked independently.
- G8.3 clarified: a non-extractable `CryptoKey` stored in IndexedDB is allowed.
- New rule: G9.5.

## 2026-10-11 · F2-15 · #11 · Approved

- Checks: CI green; e2e ✔.
- Covered: RF-18, RNF-03, RNF-04 (core part).
- New rule: G9.3 (from the lint timeouts seen while reviewing this and F1-06).

## 2026-10-11 · F2-01 · #6 · Approved

- Checks: CI green; e2e ✔. Local verify only failed on the boundary lint timeout, fixed in #12.
- Covered: RF-07.
- New rule: G9.8.

## 2026-10-11 · F1-01 … F1-07 · independent review · Changes requested, being applied

- Reviewer: a separate session (`revisioni/revisione-architetto-F1.md` in the project folder), not the author.
- Findings applied in `task/F1-04-windows-ci`: LF line endings for Windows CI, checks on Linux and the
  Windows build on pull requests and `main`, fixed WebView origin (`useHttpsScheme: false`), no Tauri
  nonce in `style-src` so Mantine styles load, and this log no longer records a self-approval.
- Open for Rei: protect `main`, open the Windows installer before Gate 2, merge `core/*` into one
  package, early local data export.
- Exception: F1 was pushed to `main` before the pull request flow existed; every later change goes
  through a pull request.

## 2026-10-11 · F1-01 … F1-07 · main (initial commit) · Written by the architect (self-check only, superseded by the independent review above)

- Checks: verify ✔, e2e ✔ (10 tests, Chromium against the built app), `cargo build` of the Tauri shell ✔ on Linux. Windows build and installer size not run yet: CI needs the GitHub repository.
- Findings: none blocking. Open points for Rei: MSI target left out (RF-24), placeholder app icon, translation files split per package.
- New rules: G1-G8 written from requirements section 11 and the F1 setup.
