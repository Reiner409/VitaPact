# Review log

Newest first. One entry per review, written by the reviewer agent (`.claude/agents/reviewer.md`).

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
