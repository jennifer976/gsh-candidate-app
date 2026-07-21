# GSH — Future considerations

Living document for product and engineering items to revisit as volume grows.  
**Last updated:** May 2026 · **Companion:** `DEPLOY_PLAYBOOK.txt`

This is not a commitment to build everything listed — it captures decisions deferred, scale triggers, and cross-repo follow-ups from recent app/website work.

---

## How to use this file

- Add a **date + note** when you pick something up or ship it.
- Use **scale triggers** (listing counts, support themes) to decide timing, not gut feel alone.
- Prefer **one durable fix** (DB / API) over duplicating config in web + app when both surfaces need the same data.

---

## 1. Jobs search UX (app + website)

**Current state (app Jobs tab):** free-text search (debounced → API `q`), horizontal **recent searches** (AsyncStorage), **Topics & filters** sheet (sectors, mobility, countries). No typeahead / autocomplete on job titles or employers yet.

**Website:** public job search uses toolbar + filters; marketing flows may use **location autocomplete** (`/api/places/suggest`) — not full job-title suggest everywhere.

### Phased plan

| Phase | Trigger (rough) | What to add | Repos |
|-------|-----------------|-------------|--------|
| **1 — Focus panel** | Anytime; low cost | On search **focus**: panel with **Recent**, **Popular** (static chips: visa, London, Engineering — reuse `EXPLORE_CHIPS` / mobility in `CandidateDiscoverRails.tsx`), link to filters. Feels like a dropdown; no new API. | `gsh-candidate-app` |
| **2 — Suggest API** | ~200+ active listings or repeated “can’t find” feedback | `GET /jobs/search-suggest?q=` returning top **titles**, **employers**, **locations** (Mongo aggregation). App shows list under search while typing. | BE + app |
| **3 — Search index** | Thousands of roles, mixed sources, ranking needs | Atlas Search / Typesense / similar; facets, typo tolerance, analytics on zero-result queries. | BE + FE + app |

**Also consider (phase 1–2):**

- **Save this search** from the focus panel → existing `job-search-alerts` candidate API (`/candidate/job-search-alerts`).
- Reuse **location suggest** on app location filter (same as web places API) when location becomes a first-class field, not only `q` text.

**Avoid for now:** inline multi-select country/industry toolbars on mobile (cramped); keep sheet/modal pattern.

---

## 2. Employer logos (web + app parity)

**Current state:**

- Logos resolve from `Profiles.companyLogo` / `postedBy` on API responses.
- **Manual overrides** for a few employers live in:
  - `global_sponsor_hub-fe/src/data/employerJobLogoOverrides.ts`
  - `gsh-candidate-app/data/employerJobLogoOverrides.ts` (keep in sync)
- Static assets under `public/employer-logos/` on the **marketing site**; app resolves `/employer-logos/…` via `EXPO_PUBLIC_SITE_URL`.

**Recommended long-term:**

1. **Bulk-import** logos into Mongo with `global_sponsor_hub_be-main/.../scripts/import-employer-company-logos.ts` (`/uploads/images/…` paths) so web and app pick them up without override lists.
2. Keep override files only for **exceptions** (dead URL, marketing-only asset).
3. **New employers:** uploading logo in employer profile should be enough — verify onboarding path sets `companyLogo` and public jobs populate it (`resolveEmployerBrandLogo` on API).

**Future check:** admin UI to attach logo to profile without SSH/script; audit logos on directory + job cards quarterly.

---

## 3. Candidate app — polish & parity backlog

Items discussed or partially shipped; confirm in production after **EAS build** + **API deploy**.

| Item | Status / notes |
|------|----------------|
| Jobs tab visual alignment with Home (dark shell, segments, cards) | Shipped in app — verify in build |
| Saved jobs list vs Home badge mismatch | BE: return all saves + `listingActive`; app refetch on `/saved` — **deploy API** |
| Messages empty state contrast on dark shell | Shipped — verify |
| Tab bar bottom inset (Android) | **1.0.1:** `tabBarBottomPadding` + edge-to-edge bootstrap — verify on devices |
| Play SDK 35 edge-to-edge / nav bar APIs | **1.0.1:** see `docs/PLAY_RELEASE_1.0.1.md` |
| Tablet / large-screen layout | **1.0.1:** `GshScreenShell constrainTabletWidth` on tab feeds |
| Sponsor badge = UK licence status (not generic “Sponsor”) | Shipped on job cards when `postedBy.sponsorLicense` present |
| Curated/external cards: summary, chips, featured, age | Shipped — dashboard curated fields need **API deploy** |
| Expert Insights entry on Home “Key tools” | Shipped — content still Supabase-driven |
| Forgot password OTP → reset screen | Shipped |
| Grow Your Network entry point | Tracked in **`docs/ADD_TO_APP_NEXT_RELEASE.md`** (web Coming soon; app handoff next release). |

**Still worth a pass:**

- **Add to app next release:** always check `docs/ADD_TO_APP_NEXT_RELEASE.md` before an EAS/Play build.
- **Expert Insights** on Home: optional dedicated section (not only tools link) when catalogue grows.
- **Push notifications** for applications/messages — wiring vs permission UX.
- **Deep links** from marketing email → correct app routes (`lib/pushNavigate.ts` maintenance).
- **Offline / poor network** messaging on job feed and apply flows.
- **Accessibility:** VoiceOver order on job cards, filter sheet, tab bar.

---

## 4. Expert Insights & content platform

**Shipped (2026):** Supabase migration `20260710_expert_insights.sql`, FE hub/checkout, BE Stripe webhook + admin API, native app routes under `/expert-insights`.

**Revisit:**

- [ ] Stripe env + setup script on API/Vercel (contributor checkout) — confirm production keys and webhook URL.
- [ ] Editorial workflow: who publishes, review, expiry, featured ordering.
- [ ] Cross-link from job search / country guides → relevant insights (SEO + app engagement).
- [ ] Analytics: hub views, article completion, contributor conversions.
- [ ] i18n if non-EN markets matter (next-intl on web; app copy today is mostly EN).

---

## 5. Curated / external jobs

**Revisit as catalogue grows:**

- [ ] **Employer logos** on external listings (only if you store `companyLogo` on `ExternalJobListing` or match to directory).
- [ ] **Ingest quality:** summary length, location/country inference, dedupe (Fantastic Jobs ingest).
- [ ] **Apply click** analytics already on BE — dashboard for ops?
- [ ] Clear UX when listing **expires** (app detail + list).

---

## 6. Backend & infrastructure (next months)

| Area | Consideration |
|------|----------------|
| **Search at scale** | See §1 phase 3; monitor slow `q` regex queries on `Job` collection. |
| **Caching** | Public job list CDN or short TTL cache if traffic spikes. |
| **Observability** | Sentry on API (`SENTRY_DSN`) + FE (`NEXT_PUBLIC_SENTRY_DSN`); alert on 5xx rate. |
| **CORS / env** | `CORS_ORIGINS`, `FRONTEND_URL`, mobile app origins if needed. |
| **Mongo indexes** | Review indexes for `title`, `companyName`, `locationCountry`, `status`, `expiresAt` on jobs. |
| **Rate limiting** | Public search and auth endpoints under abuse. |
| **Backups** | Mongo + Supabase backup/restore drill once per quarter. |

---

## 7. Website (FE) — upcoming months

- [ ] Job search parity with app filters where it helps SEO (structured filters in URL).
- [ ] **Employer directory** growth — sponsor licence badges consistent with `JobMarketingCard`.
- [ ] **Core Web Vitals** on `/jobs` and `/expert-insights` as content grows.
- [ ] **Admin:** relocation perks `candidateTitle` vs internal “perks” labelling — already started; extend to other admin copy.
- [ ] Next.js upgrades — track `@sentry/nextjs` peer support for Next 16.

---

## 8. Mobile release rhythm

- **Next store binary:** **1.0.1** — `docs/PLAY_RELEASE_1.0.1.md` (edge-to-edge, Play Console items).
- [ ] **EAS:** production profile env (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SITE_URL`, Supabase public keys, `EXPO_PUBLIC_GSH_MOBILE_REGISTRATION_KEY`).
- [ ] Store listings (screenshots reflecting Jobs/Home parity).
- [ ] **OTA vs native:** document which changes need new binary vs Expo Updates.
- [ ] Test **saved jobs**, **apply**, **messages**, **Expert Insights** on staging API before store submit.

---

## 9. Product / ops (non-code)

- [ ] **Support playbook:** “saved job not showing”, “logo missing”, “curated apply off-site”.
- [ ] **Employer onboarding:** checklist for logo, sponsor licence, first live job.
- [ ] **Metrics:** active jobs, applications/week, curated apply clicks, app MAU, search queries with zero results.
- [ ] **Compliance:** privacy policy / app store data safety aligned with messaging and CV visibility.

---

## 10. Quick reference — key files

| Topic | Location |
|-------|----------|
| App Jobs tab | `gsh-candidate-app/app/(tabs)/jobs.tsx` |
| Discover filters | `gsh-candidate-app/components/CandidateDiscoverRails.tsx` |
| Recent searches | `gsh-candidate-app/lib/recent-job-searches.ts` |
| Logo overrides (app) | `gsh-candidate-app/data/employerJobLogoOverrides.ts` |
| Logo overrides (web) | `global_sponsor_hub-fe/src/data/employerJobLogoOverrides.ts` |
| Logo import script | `global_sponsor_hub_be-main/.../scripts/import-employer-company-logos.ts` |
| Saved jobs API | `global_sponsor_hub_be-main/.../src/controllers/savedJobs.ts` |
| External listings API | `global_sponsor_hub_be-main/.../src/controllers/externalJobListings.ts` |
| Expert Insights migration | `global_sponsor_hub-fe/supabase/migrations/20260710_expert_insights.sql` |
| Deploy steps | `DEPLOY_PLAYBOOK.txt` |

---

## Changelog

| Date | Note |
|------|------|
| 2026-05-26 | Initial doc: search phases, logos, app parity backlog, Expert Insights, scale/ops checklist. |
| 2026-05-26 | Play 1.0.1 prep: edge-to-edge, tablet shell, `PLAY_RELEASE_1.0.1.md`. |
