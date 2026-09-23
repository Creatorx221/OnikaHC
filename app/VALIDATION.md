# Validation — Heuresis website preview

Completed on 6 September 2026.

## Passed
- Production Worker build; TypeScript check without errors.
- HTTP checks for home, research, all six sample articles, Services, About, Contact and all three draft policy pages: 200.
- Missing report route: 404.
- Unique page titles, preview noindex metadata, robots response and sitemap response.
- Public-mode branch test: home/library contain no sample article; direct sample route and all unapproved policy routes return 404; no draft privacy links are emitted; sitemap contains no sample.
- Browser journey from home to library and from library to the bank-earnings article.
- Load more expands four visible results to six.
- Search + Equities + Banking gives the expected single bank-earnings sample and shareable URL. Filters remain selected after reloading.
- A non-matching search gives zero results; reset restores six results and clears filters.
- Services CTA preselects Bespoke research and the Equities topic.
- Invalid enquiry email produces native typeMismatch validation. Sending stays disabled while unconfigured.
- Mobile menu opens, closes with Escape and restores focus to its trigger.
- Copy link changes to Link copied.
- Layout inspections at approximately 1440px (desktop home), 768px (tablet research library) and 375px (mobile article, enquiry and footer). No horizontal overflow in the measured layouts. Original logo assets load.
- Synthetic chart values agree with the accessible table: 25, 15 and 15 index units.
- Both unconfigured form endpoints return HTTP 503 and accepted:false. Newsletter UI clearly shows that sign-up is unavailable.

## Limits and launch checks still required
- Email/CRM/newsletter delivery, provider acceptance, unsubscribe and production spam protection cannot be tested until integrations are configured.
- There is no research PDF to download. The optional PDF link is therefore omitted.
- Print CSS is included; a physical print or exported browser PDF was not generated.
- Browser checks were targeted, not a full assistive-technology or cross-browser accessibility audit.
- The public-mode test exercised the central visibility flag locally; final hosted environment configuration must be smoke-tested again at launch.
- Custom domain routing, SSL and live email DNS were not changed or tested.


## Publishing backend — 13 September 2026

- TypeScript check passed after adding the publishing workspace and backend.
- Full Worker production build passed with D1 and R2 bindings and generated migrations.
- Fresh local D1 migration applied successfully.
- 37 local HTTP checks passed: sign-in, spoofed-header rejection, anonymous API rejection, invalid JSON/slug/source URL rejection, duplicate slug, required publication fields, draft privacy, upload format rejection, file attachment and downloading, publish/edit snapshot separation, stale revision conflicts, unpublish privacy, attachment ownership, archive and restore.
- Five unapproved-user checks passed after restarting with a separate owner configuration: access requests are allowed, but reading drafts, creating research and self-approval are rejected.
- Test content and files exist only in the local database; the test publication was archived.
- Browser automation was not performed for this backend update. Earlier visual checks below relate to the previous public website revision.

## Website and publishing integration — 23 September 2026

- Verified the Gemini delivery manifest against all 21 changed files and the handoff source snapshot before integration. Kept the exact approved logo image.
- `pnpm exec tsc --noEmit` and `pnpm build` passed after integration.
- The existing publishing test completed 37 local HTTP checks. The expanded website test completed 76 local HTTP checks, including draft privacy, owner preview, team photo publication and removal, standalone file access, research attachment order and replacement, and archive safeguards.
- The signed-in non-owner access test passed its five checks with a separate local owner setting. The original local owner setting was restored afterward.
- Applied both migrations to a separate local D1 instance for the built Worker. Browser clicks on the production-built homepage reached Research and Contact with the expected pages and controls. This specifically rechecks the earlier production navigation failure.
- Repository-wide `pnpm lint` still reports existing generated UI and application warnings, including Next.js `<img>` and native link rules. The production build, type check and behavior checks are the release gates used here; lint is not recorded as passing.
- All generated research, images and documents used by the tests were local fixtures. No production research or file records were changed by these checks.
