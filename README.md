# Heuresis Capital

The Heuresis Capital research website and secure publishing desk.

- [Live website](https://heuresis-capital-research.bgene2717.chatgpt.site)
- [Research publishing desk](https://heuresis-capital-research.bgene2717.chatgpt.site/admin)
- [Application source and full guide](app/README.md)
- [Validation record](app/VALIDATION.md)

## Project location

The complete application is in **`app/`**. Its `app/app/` directory contains the website routes; this is intentional. Run development and build commands from the outer `app` directory.

```sh
cd app
pnpm install --frozen-lockfile
pnpm build
```

Requires Node.js 22.13 or later and pnpm. See the application guide for local database setup and testing.

## Publishing research

Open the publishing desk and sign in with ChatGPT using the approved owner account. Select **New research**, save a draft, upload supporting materials, preview, and publish. Published research appears immediately. Owners manage additional editors through **Team access**.

GitHub stores source code. Research articles and uploaded materials live in the managed database and private file storage; they are not stored or backed up by this repository. Research publishing does not require a source commit.

## Hosting and domain

The production website runs on Sites with managed database, storage and authentication. A GitHub commit does not automatically redeploy the website. Preserve the existing Site identity in `app/.openai/hosting.json`; follow `app/README.md` when deploying source changes.

The custom domain is **heuresiscapital.com**, managed by IONOS. Domain activation requires completing the supplied DNS setup. The contact address is **info@heuresiscapital.com**.

Never commit credentials, runtime secrets, local test data or database exports.
