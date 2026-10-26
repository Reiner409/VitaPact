# Contributing to VitaPact

Thanks for helping. VitaPact is a small offline app, and the rules below keep it that way.

## Before you start

- Read [GUIDELINES.md](GUIDELINES.md). It holds the team rules, and every review checks them.
- Find your task in [docs/tasks.md](docs/tasks.md); the requirements it refers to are in
  [docs/requirements.md](docs/requirements.md).
- The app never uses the network. A change that adds a remote origin, a CDN, a remote font or
  analytics will not be accepted.

## Set up

```sh
git clone https://github.com/Reiner409/vitapact
cd vitapact
pnpm install
pnpm web:dev   # the app in the browser on http://localhost:1420
```

The README explains how to run the desktop and Android apps.

## Make a change

1. Create a branch from `main`, one per task: `task/<task id>-<short name>`.
2. Write the tests first. Each test title names the requirement it checks, such as `RF-03`.
3. Write the simplest code that passes, then clean it up.
4. Run every check before you push:

   ```sh
   pnpm verify
   pnpm test:e2e
   ```

5. Open a pull request to `main` and fill in the template. Its title becomes the commit subject,
   so write it as an imperative sentence of at most 72 characters that ends with the task id.

Pull requests are merged with "Squash and merge" once the review approves them and CI is green.
Nobody pushes to `main` directly.

## Licence

VitaPact is licensed under the GNU General Public License v3.0 only (see [LICENSE](LICENSE)). By
contributing you agree that your work is published under the same licence.
