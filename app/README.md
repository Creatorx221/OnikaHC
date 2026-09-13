# Heuresis Capital

Capital markets research website and secure publishing desk, using the approved Modern Precision logo with the connected three-arm symbol.

- Website: https://heuresis-capital-research.bgene2717.chatgpt.site
- Publishing desk: https://heuresis-capital-research.bgene2717.chatgpt.site/admin
- Source: https://github.com/Creatorx221/OnikaHC
- Custom domain: https://heuresiscapital.com (IONOS DNS setup is separate)
- Contact: info@heuresiscapital.com

## Publishing research

1. Open `/admin` and choose **Sign in with ChatGPT**. The configured owner has access; other people request access and wait for approval under **Team access**.
2. Choose **New research**. Add a title, summary, category, author, date, topics, three takeaways, analysis sections, sources and disclosures. The web address stays fixed after the first save.
3. **Save draft** to keep work private. Upload PDF, XLSX, CSV, DOCX, PPTX, PNG or JPEG files, up to 10 MB each. Select up to 20 attachments and save again.
4. **Preview draft**, then **Publish** and confirm. The article and selected files become public immediately. Research updates require no code change or redeployment.
5. Further edits are saved separately from the published version. Publish again when ready. **Unpublish** takes the article and downloads offline. **Archive** keeps an inactive draft that can be restored.

All approved editors can edit and publish all research. Only owners can approve or revoke editor access. Concurrent edits produce a conflict instead of silently overwriting work. There is no automatic saving: save before leaving.

Public content is the default. The six illustrative samples remain in source for demonstrations and are excluded from the live library and direct public URLs. Genuine research and author biographies have not been invented. Unapproved company claims and draft policies stay hidden until reviewed in `lib/site-config.ts`.

## Backend and access

Vinext, React and TypeScript run on Cloudflare Workers through Sites. Managed D1 database storage (`DB`) holds drafts, published snapshots, file metadata and editor requests. Private R2 storage (`BUCKET`) holds uploaded materials. Schema and versioned migrations are in `db/` and `drizzle/`. Content persists across deployments and is separate from GitHub source.

Sites provides Sign in with ChatGPT through its trusted dispatcher. Authorization uses its stable site-specific user ID. Email addresses are display information and do not grant rights. Set runtime `CMS_ADMIN_USER_IDS` to a verified owner's site-specific identifier, or a comma-separated list. Never use a GitHub ID, email address or local fixture in production. A signed-in user can see their own ID at `/api/admin/session` or on the access request screen. Without an owner configuration, the desk stays locked.

Manage runtime values through Sites environment settings and redeploy a saved version to apply changes. Never commit secrets. `.env*`, `.dev.vars*`, build outputs and local database files are ignored.

Each administrative API authorizes on the server. Mutations require a matching Origin. Files are checked for allowed extensions and basic signatures, then served as attachments with no-sniff headers. These checks are not antivirus scanning. Only attachments referenced by the current published snapshot are public; other files require approved editor access. The bucket is not publicly listed.

This source depends on the Sites authentication gateway. Deploying elsewhere requires replacing that trusted boundary; do not expose a Worker that trusts arbitrary incoming identity headers.

## Local development

Node 22.13 or later and pnpm are required.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --file drizzle/0000_clumsy_wendell_vaughn.sql --persist-to .wrangler/state
pnpm dev
```

The database command is for a fresh local database. Keep applied migrations immutable; generate a new migration with `pnpm db:generate` after a schema change.

For local owner testing, create ignored `.dev.vars` containing `CMS_ADMIN_USER_IDS=local_seedy` and restart the server. Loopback development hosts use the Sites local sign-in fixture. Remove fixture configuration before packaging a release.

```sh
pnpm exec tsc --noEmit
pnpm test:publishing
```

The publishing test accepts loopback URLs only and archives its test article. For the unapproved-user test, set `.dev.vars` to `CMS_ADMIN_USER_IDS=local_owner_test`, restart and run `pnpm test:access`. Restore the owner fixture and restart for further owner tests.

## Hosting and source

Preserve the existing Site identity in `.openai/hosting.json`. Build the Worker, push the exact source to the Sites source repository, package `dist` including its `.openai` manifest and `drizzle` migrations, save a version with the full pushed commit SHA, then deploy that saved version. Sites provisions storage and applies migrations. Local test data is not packaged.

GitHub holds the editable source. A GitHub push does not automatically deploy this Site; no deployment Actions workflow is configured. Publishing research through the desk works immediately without a GitHub push.

Database contents and uploaded files are not backed up by a source push. Retain original research files and arrange database/storage exports through the hosting account for operations.

The apex and www domains have already been registered with Sites. Complete the returned IONOS DNS verification and routing records, then check HTTPS status. Preserve IONOS email records. The separately supplied domain guide contains the registration-specific DNS values.

## Other content

Brand details: `lib/brand.ts`. Approved company facts and visibility: `lib/site-config.ts`. Reviewed policies: `lib/policies.ts`. An optional file-based research collection remains in `content/reports/`; use the desk for normal publishing.

The contact form prepares an email draft for the visitor to send. Update requests open their email app. No automated mailing list, billing or outbound email service is connected. Local font licences are included in `public/fonts`.

See `VALIDATION.md` for performed checks and their limits.
