# Heuresis Capital

Capital markets research website and secure publishing desk, using the owner's approved Heuresis Capital logo with the connected three-arm symbol.

- Website: https://heuresiscapital.com
- Publishing desk: https://heuresiscapital.com/admin
- Source: https://github.com/Creatorx221/OnikaHC
- Domain and email: IONOS; the website domain is connected to the existing Sites project.
- Contact: info@heuresiscapital.com

## Publishing research

1. Open `/admin` and choose **Sign in with ChatGPT**. The configured owner has access; other people request access and wait for approval under **Team access**. An approved team member has editorial access to research, website content, team profiles and website files.
2. Choose **New research**. Add a title, summary, category, author, date, topics, three takeaways, analysis sections, sources and disclosures. The web address stays fixed after the first save.
3. **Save draft** to keep work private and enable uploads. Upload PDF, XLSX, CSV, DOCX, PPTX, PNG or JPEG files, up to 10 MB each. Select up to 20 attachments, move them up or down into the intended order, and save again.
4. **Preview draft**, then **Publish** and confirm. The article and selected files become public immediately. Research updates require no code change or redeployment.
5. Further edits are saved separately from the published version. Publish again when ready. **Unpublish** takes the article and downloads offline. **Archive** keeps an inactive draft that can be restored.

To replace a research file, choose **Replace file** beside that selected attachment, upload the newer file, save the draft, then publish. The older public download remains available until publication of the replacement. An unused upload can be archived and restored; remove a selected file from the saved draft and publish any live change before archiving it.

## Managing the website

An approved editor opens **Website content** from `/admin`. Each section has labelled fields for the public pages, navigation, company details and contact information. Changes follow **Save draft → Preview saved draft → Publish changes**. Preview opens the saved version in a private editor-only page; unsaved edits are not included. Publishing one section does not publish other drafts. **Discard draft changes** restores that section to its currently published version. Published changes appear on the website without a code deployment.

Open **Team profiles** to add a person's name, role, biography, credentials, photo and optional public contact links. Add or remove entries, move them into order, save and preview, then publish to update the About page. A hidden person does not appear publicly. These public profiles are separate from **Access**, which controls real editor accounts. Enter only real people and approved biographies for production.

Open **Files** to upload a logo, photo or standalone document, search existing files, and view archived files. Uploads remain private until linked from published content. In **Document library**, add a title, description, category and selected file for each resource. Move entries up or down, replace a file, hide or remove an entry, then publish. The public `/resources` page and its downloads follow the published version. After replacing a document, archive the old file only after the published page no longer uses it.

Use **Brand, navigation & footer** for the logo, contact email, navigation and footer links. The approved Heuresis Capital Research logo is included in `public/logo-research-light.png` and `public/logo-research-navy.png` for light and dark surfaces. The former built-in path, `public/logo-approved.png`, also serves the approved light artwork so saved settings remain valid. The contact form and research-update button prepare email drafts for visitors to send in their own email apps. No server-side inbox or automatic mailing list is connected.

The public header offers **EN**, **FR** and **IT**. A language choice stays active as visitors follow internal links and use research filters. Built-in page and interface wording has French and Italian translations. To translate custom page text, open its section in **Website content** and expand **French & Italian translations** below the relevant field. Save, preview and publish the section. Empty translation fields show the English text. Names, handles, destinations and uploaded files are shared across languages.

For an article, use the **French and Italian translations** panels in its research editor. Translate the title, summary, all three takeaways, every section heading and paragraph, and disclosures, then save and publish. A complete edition appears in its chosen language; until then the English article remains available with an English-only notice. Attached PDFs and other materials are the same in all languages, so upload translated documents separately if needed. Translation is editorial, not automatic, to avoid publishing unreviewed research wording.

To add social links, open **Brand, navigation & footer → Social media profiles**. Add each platform, display handle and full HTTPS profile URL. Move profiles up or down to set their order, or turn off **Show this profile** to hide one. Save, preview and publish that section; visible profiles then appear in the public footer. Do not enter a platform until its real account and URL are ready.

All approved editors can edit and publish all research, website sections and team profiles; they can also upload, replace and archive website files. Existing approved teammates receive this editorial access automatically after deployment. Only owners can approve or revoke editor access or change the site's hosting and runtime settings. Concurrent edits produce a conflict instead of silently overwriting work. There is no automatic saving: save before leaving.

Public content is the default. The six illustrative samples remain in source for demonstrations and are excluded from the live library and direct public URLs. Genuine research and author biographies have not been invented. Unapproved company claims and draft policies stay hidden until reviewed and published from the content workspace. Historical preview controls remain in `lib/site-config.ts`.

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
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --file drizzle/0001_bizarre_retro_girl.sql --persist-to .wrangler/state
pnpm dev
```

The database commands are for a fresh local database only. Do not replay a migration on a database that already received it. Keep applied migrations immutable; generate a new migration with `pnpm db:generate` after a schema change. The 0001 migration adds website content, assets and reversible research-file archival. Sites applies migrations during hosted deployment; verify its migration state first.

For local owner testing, create ignored `.dev.vars` containing `CMS_ADMIN_USER_IDS=local_seedy` and restart the server. Loopback development hosts use the Sites local sign-in fixture. Remove fixture configuration before packaging a release.

```sh
pnpm exec tsc --noEmit
pnpm test:publishing
node tests/website.mjs
```

Both publishing tests accept loopback URLs only and archive their test research. `tests/website.mjs` also publishes and then removes local-only content fixtures; it must never target production. For the unapproved-user test, set `.dev.vars` to `CMS_ADMIN_USER_IDS=local_owner_test`, restart and run `pnpm test:access`. For the approved-editor test, use that same alternate owner setting and approve the local `local_seedy` fixture in the **local D1 database only**, then run `pnpm test:editor-access`. This checks website content, previews and files while confirming that Access remains owner-only. Restore the original owner setting and local request row afterward. Never use these fixtures against the hosted Site.

## Hosting and source

Preserve the existing Site identity in `.openai/hosting.json`. Build the Worker, push the exact source to the Sites source repository, package `dist` including its `.openai` manifest and `drizzle` migrations, save a version with the full pushed commit SHA, then deploy that saved version. Sites provisions storage and applies migrations. Local test data is not packaged.

GitHub holds the editable source. A GitHub push does not automatically deploy this Site; no deployment Actions workflow is configured. Publishing research through the desk works immediately without a GitHub push.

Database contents and uploaded files are not backed up by a source push. Retain original research files and arrange database/storage exports through the hosting account for operations.

The apex and www domains are already connected to the existing Sites project. Preserve the IONOS email records; code deployment does not require a DNS change.

## Other content

Brand details: `lib/brand.ts`. Approved company facts and visibility: `lib/site-config.ts`. Reviewed policies: `lib/policies.ts`. An optional file-based research collection remains in `content/reports/`; use the desk for normal publishing.

The contact form prepares an email draft for the visitor to send. Update requests open their email app. No automated mailing list, billing or outbound email service is connected. Local font licences are included in `public/fonts`.

See `VALIDATION.md` for performed checks and their limits.
