# Review log

Newest first. One entry per review, written by the reviewer agent (`.claude/agents/reviewer.md`).

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
