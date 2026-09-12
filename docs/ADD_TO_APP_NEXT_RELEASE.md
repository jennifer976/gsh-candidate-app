# Add to app — next release

**Purpose:** Single checklist for anything that ships on the **website** (or is decided in chat) but is **not yet in the candidate app**, or must wait for the **next** Play/App Store binary.

**How we use it**
1. When we gate or ship something on web only, **add a row here the same day**.
2. Before starting a new EAS / Play build, **read this file** and decide what lands in that release.
3. After something ships in an app build, move it to **Done in a release** (with version / date).
4. Do **not** assume “web is done ⇒ app is done.” Web and app are separate repos.

**App repo:** `gsh-candidate-app` → `jennifer976/gsh-candidate-app`  
**Playbook:** root `DEPLOY_PLAYBOOK.txt` → **BLOCK 3B**

---

## Queued for next app release

| Priority | Item | Web status (today) | App work needed | Notes |
|----------|------|--------------------|-----------------|-------|
| P0 | **Find → Move copy** | Live on www | In this worktree: home is find · move (not hire); jobs tabs Direct / External / Agency listed; specialists sit under Move. Include in next binary. | Candidates stay free. No GSH acronym. |
| P0 | **Company sponsor checker** | Coming soon (`/tools/visa-checker`) | Already **Coming soon** in app (`5e1c73c`). Next release: turn **live** when register coverage is ready (restore search UI; keep naming “Company sponsor checker”, not Visa Wizard). | Do not launch live until you say so. |
| P1 | **Grow Your Network** | Coming soon (`/grow-your-network`) | First-party in-app-browser row is present in Resources. Keep the destination labelled Coming soon until web community threads exist. | No native community directory until usage proves value. |
| P2 | Parity pass after web launch | — | When web removes Coming soon for the above, **same day** update app copy/UI or ship follow-up build. | Avoid another “live on web, unfinished in app” gap. |

---

## Phase 7 candidate parity — implemented for next binary

Implemented in the isolated Phase 7 mobile worktree; this status does not mean a Play/App Store binary has shipped.

| Area | Native app status | Backend mapping / limitation |
|------|-------------------|------------------------------|
| Global Mobility Profile | Native `/mobility-profile`: canonical ISO alpha-2 countries, structured residence/citizenship/occupations/authorizations/employment options/qualification award and expiry dates/registration number and expiry/targets, sponsorship/relocation, availability, salary, readiness guidance, self-attestation copy, and employer discovery consent. Four readiness dimensions and a contact-safe employer preview are shown on Profile. | `GET /profile/me`, `PUT /profile`; preserves server-owned evidence provenance and consent policy handling. Employer preview excludes contact details, citizenship, CV URLs, and registration numbers. |
| Direct-job compatibility | Native direct-job detail card plus bounded first-20 batch badges on Jobs. Compatibility-first ordering is optional and hides no roles. Jobs now separates Direct, Employer-connected, and Curated external feeds; only Direct receives the direct-job comparison. | `POST /compatibility/jobs/:jobId/me`, `POST /compatibility/jobs/me/batch`; connected/curated use filtered external-listing reads. Ruleset, evaluated time, reasons, missing-profile CTA, and backend disclaimer are displayed. |
| Relocation help | Native `/relocation-help` create/list and `/relocation-help/[id]` detail/withdraw/close. Contact and provider-sharing consents are separate, explicit, and required. | Phase 6 candidate-owned list and detail endpoints; legacy detail fallback is limited to a backwards-compatible 404. |
| Agency introductions | Native `/agency-introductions` inbox and `/agency-introductions/[id]` detail. Accept/decline is exposed only from `consent_pending` and uses a stable transition idempotency key. | Phase 6 candidate introduction list/detail/status endpoints and declared lifecycle. No agency/admin dashboard surface is included. |
| Extraction review | Native typed `/profile-extraction-review` processing/error/expiry/provider-unavailable and candidate review states. Every suggestion must be accepted or rejected before update. | Governed candidate extraction status/draft/review endpoints. No provider key or direct model call exists in the app. |
| Analytics | Explicit entry actions use bounded `global_mobility_profile_started` / `relocation_help_started` events with candidate role/audience only. Session duplicates are suppressed; Phase 6 backend already records successful request/consent events. | Existing `/analytics/journey-event` allowlist and backend consent/auth attachment. No PII or free text is sent. |
| Jobs, applications, alerts and matches | Direct and external feeds paginate. Closed/paused/expired roles cannot be applied to; readiness, screening answers, stable application idempotency, withdrawal states and interview details are surfaced. Saved-search filters use the web contract, and canonical/legacy match shapes normalize to rules-based reasons. | Candidate matches use `/candidate/job-matches`; applications use the declared idempotent create contract. |
| Employers, resources and offers | Native employer profile/follow/unfollow/list screens; seven canonical candidate resources plus saved-resource create/list/delete; governed benefit projection hides incomplete, ineligible, expired, withdrawn, or unapproved-host offers. | Employer follows and candidate tools endpoints. Offers use `GET /relocation-perks?audience=candidate`. |
| Deep links and validation | Auth, alerts, matches, notifications, benefits, candidate profile, relocation, and introduction paths resolve for HTTPS and the custom scheme. Push links are limited to governed first-party destinations. | Local fixture coverage states routing expectations only; domain association and signed-device verification remain outstanding. |

### Remaining pre-release checks / gaps

- Run native Android and iOS screen-reader, keyboard, back-navigation and 390px device checks; static/type/export checks do not replace device testing.
- Confirm production notifications emit the maintained relocation-help and candidate-introduction canonical links.
- A unit-test runner is not configured in this app. `validate:phase7-parity` uses deterministic contract fixtures for route captures, custom-scheme/HTTPS mappings, canonical and legacy match IDs, benefit fail-closed cases, API mappings, ISO aliases, the 20-job bound, extraction decisions, and AI guardrails.

---

## Ideas / later (not blocking next binary)

- Native Grow Your Network screens (only after in-app browser proves demand).
- Push notifications polish (applications / messages and production Phase 6 payload verification).
- Expert Insights Home section (beyond tools link) when catalogue grows.
- Offline / poor-network messaging on job feed and apply.
- See also: `docs/FUTURE_CONSIDERATIONS.md` (broader backlog).

---

## Done in a release

| App version / commit | Date | What shipped |
|----------------------|------|--------------|
| `1.0.2` (this worktree) | 2026-09-12 | Find → Move home, Direct / External / Agency listed jobs, matching nudge, blog/guides/specialists on Home, light candidate chrome. |
| `1.0.1` / `30941a9` | 2026-07 | Visual review: All jobs / Curated roles, Filter while searching, chart colours, FAQ/tools/a11y polish. |
| `5e1c73c` (include in next Play upload) | 2026-07-21 | Company sponsor checker gated as **Coming soon**; labels clarified vs Visa Wizard. |

---

## Template (copy a row when adding)

```
| P? | **Short name** | Web: … | App: … | Notes: … |
```
