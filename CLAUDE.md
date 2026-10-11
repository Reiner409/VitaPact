# VitaPact

Offline Windows desktop app (Tauri 2 + React + TypeScript + Mantine 9) where a few friends track
sleep, training, clean eating and sun, weigh in on Sundays and swap a signed weekly report as a
QR image. No network, no account, no cloud. Licence GPL-3.0.

**Before any task, read `GUIDELINES.md`.** It is the team's shared memory and the reviewer
enforces it.

## Layout

| Folder            | Package                   | Contains                                                                          |
| ----------------- | ------------------------- | --------------------------------------------------------------------------------- |
| `app/`            | `@vitapact/app`           | Composition root: Vite entry, navigation, providers                               |
| `screens/<name>/` | `@vitapact/screen-<name>` | One screen: onboarding, today, week, friends, noteboard, settings                 |
| `shared/ui/`      | `@vitapact/ui`            | Tokens, Mantine theme, icons, shared components; `@vitapact/ui/testing` for tests |
| `shared/i18n/`    | `@vitapact/i18n`          | i18next setup; shared namespaces (`content` = verdicts and weekend phrases)       |
| `core/<name>/`    | `@vitapact/core-<name>`   | Pure logic: calendar, pillars, scoring, report, storage, groups, crypto           |
| `platform/`       | `@vitapact/platform`      | The only Tauri user: save file, open image                                        |
| `src-tauri/`      |                           | Rust shell, permissions, CSP, bundle config                                       |
| `tools/`          |                           | Repo checks: i18n keys, boundaries, raw style values, matrix, installer size, CSP |
| `e2e/`            |                           | Playwright tests with the network guard                                           |
| `docs/`           |                           | Traceability matrix, review log                                                   |

## Commands

```sh
pnpm install
pnpm verify            # types, lint, format, unit tests, i18n keys, traceability matrix
pnpm test              # unit and component tests (Vitest)
pnpm test:e2e          # Playwright against the built web app
pnpm web:dev           # browser dev server on :1420
pnpm dev               # Tauri dev window (needs Rust and WebView2 / webkit2gtk)
pnpm build             # Windows installer (run on Windows or in CI)
```

In a cloud container without Playwright's own browser, run end-to-end tests with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium pnpm test:e2e`.

## Working on a task

The repository is https://github.com/Reiner409/vitapact; `main` is protected by review. Work in a
local clone, one branch per task:

```sh
git clone https://github.com/Reiner409/vitapact ~/vitapact && cd ~/vitapact
git config user.name "Rei"
git config user.email "72210285+Reiner409@users.noreply.github.com"
git switch -c task/F2-05-pillars
pnpm install
# red, green, clean ... then
pnpm verify && pnpm test:e2e
git push -u origin task/F2-05-pillars
```

Then open a pull request to `main` using the template and ask the reviewer
(`.claude/agents/reviewer.md`) to review it. The pull request title follows GUIDELINES G6.7, because
it becomes the commit subject: Rei merges with "Squash and merge", so each task lands on `main` as
one commit authored by Rei. Never push to `main` directly.

Commits follow GUIDELINES G6.6-G6.7: authored by Rei, one per task, written like a person would
write them, no AI trailers.

`/mnt/project-files/vitapact` is a read-only mirror of `main` for browsing; never commit there.
