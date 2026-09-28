# Key page dependency trees

These are the recursive local dependency candidates for ten representative routes. Node-module imports are omitted. Repeated low-level trees are expanded once under **Shared recursive subtrees** and referenced by ID to keep this discovery file bounded and deduplicated.

## 1. `/home` — Home / candidate command centre

Entry: `app/(tabs)/home.tsx`

- `app/(tabs)/home.tsx`
  - `components/DashboardHubJobPreview.tsx`
    - `components/CompanyLogo.tsx` → `lib/theme.ts`
    - `components/GshPressable.tsx`
    - `lib/brand-logo.ts`
      - `data/employerJobLogoOverrides.ts`
      - `lib/media-url.ts` → `lib/config.ts`
      - `types/models.ts`
    - `lib/job-display.ts` → Shared S3
    - `lib/theme.ts`
    - `types/models.ts`
  - `components/GshChromeIconButton.tsx`
    - `components/GshPressable.tsx`
    - `lib/theme.ts`
  - `components/GshHeroWash.tsx`
  - `components/GshHomeDestinationRail.tsx`
    - `components/GshPressable.tsx`
    - `lib/theme.ts`
  - `components/GshHomeProfileChecklist.tsx`
    - `components/GshPressable.tsx`
    - `lib/theme.ts`
  - `components/GshPressable.tsx`
  - `components/GshScreenShell.tsx`
    - `lib/screen-layout.ts`
    - `lib/theme.ts`
  - `components/GshEmptyState.tsx`
    - `lib/brand-assets.ts`
    - `lib/theme.ts`
  - `components/GshMissionBanner.tsx`
    - `components/GshPressable.tsx`
    - `lib/theme.ts`
  - `lib/i18n/index.ts` → Shared S1
  - `lib/i18n/catalog.ts` → Shared S1
  - `lib/brand-assets.ts`
  - `lib/api-client.ts` → Shared S2
  - `lib/api-error.ts`
    - `lib/i18n/catalog.ts` → Shared S1
    - `lib/api-client.ts` → Shared S2
  - `lib/android-insets.ts`
  - `lib/profile-completion.ts` → `lib/i18n/catalog.ts` → Shared S1
  - `lib/motion.ts`
  - `lib/screen-layout.ts`
  - `lib/theme.ts`

## 2. `/jobs` — Jobs feed

Entry: `app/(tabs)/jobs.tsx`

- `app/(tabs)/jobs.tsx`
  - `components/CandidateDiscoverRails.tsx`
    - `components/GshSheetGrabber.tsx` → `lib/theme.ts`
    - `lib/i18n/useAccountCopy.ts` → Shared S1
    - `lib/i18n/index.ts` → Shared S1
    - `lib/i18n/catalog.ts` → Shared S1
    - `lib/job-presentation.ts` → Shared S4
    - `lib/jobDiscoverCountries.ts`
    - `lib/job-display.ts` → Shared S3
    - `lib/theme.ts`
    - `types/models.ts`
  - `components/CompanyLogo.tsx` → `lib/theme.ts`
  - `components/CuratedExternalJobCard.tsx`
    - `components/CompanyLogo.tsx` → `lib/theme.ts`
    - `lib/i18n/index.ts` → Shared S1
    - `lib/job-presentation.ts` → Shared S4
    - `lib/curated-listing-labels.ts` → `types/models.ts`
    - `lib/job-display.ts` → Shared S3
    - `lib/mobility-chip-styles.ts` → `lib/theme.ts`
    - `lib/theme.ts`
    - `types/models.ts`
  - `components/SkeletonLoader.tsx` → `lib/theme.ts`
  - `components/GshDarkFeedHeading.tsx` → `lib/theme.ts`
  - `components/GshScreenShell.tsx` → `lib/screen-layout.ts`, `lib/theme.ts`
  - `components/GshSwipeAction.tsx` → `lib/theme.ts`
  - `components/GshTabStickyHeader.tsx` → `lib/theme.ts`
  - `lib/i18n/useAccountCopy.ts` → Shared S1
  - `lib/i18n/index.ts` → Shared S1
  - `lib/i18n/catalog.ts` → Shared S1
  - `lib/job-presentation.ts` → Shared S4
  - `lib/android-insets.ts`
  - `lib/brand-assets.ts`
  - `lib/api-client.ts` → Shared S2
  - `lib/compatibility.ts` → `types/models.ts`, `types/mobility.ts`
  - `lib/haptics.ts`
  - `lib/job-display.ts` → Shared S3
  - `lib/mobility-chip-styles.ts` → `lib/theme.ts`
  - `lib/recent-job-searches.ts`
  - `lib/theme.ts`
  - `types/models.ts`
  - `types/mobility.ts`

## 3. `/applications` — Application tracker tab

Entry: `app/(tabs)/applications.tsx`

- `app/(tabs)/applications.tsx`
  - `components/CompanyLogo.tsx` → `lib/theme.ts`
  - `components/GshScreenShell.tsx` → `lib/screen-layout.ts`, `lib/theme.ts`
  - `components/GshTabStickyHeader.tsx` → `lib/theme.ts`
  - `lib/i18n/index.ts` → Shared S1
  - `lib/i18n/catalog.ts` → Shared S1
  - `lib/brand-assets.ts`
  - `lib/android-insets.ts`
  - `lib/api-client.ts` → Shared S2
  - `lib/theme.ts`
  - `types/models.ts`

## 4. `/messages` — Conversation inbox

Entry: `app/(tabs)/messages.tsx`

- `app/(tabs)/messages.tsx`
  - `components/gsh-ui-kit.tsx`
    - `components/GshPressable.tsx`
    - `lib/screen-layout.ts`
    - `lib/theme.ts`
  - `components/GshScreenShell.tsx` → `lib/screen-layout.ts`, `lib/theme.ts`
  - `components/GshTabStickyHeader.tsx` → `lib/theme.ts`
  - `lib/i18n/useAccountCopy.ts` → Shared S1
  - `lib/i18n/index.ts` → Shared S1
  - `lib/brand-assets.ts`
  - `lib/android-insets.ts`
  - `lib/api-client.ts` → Shared S2
  - `lib/theme.ts`
  - `types/models.ts`

## 5. `/profile` — Candidate profile

Entry: `app/(tabs)/profile.tsx`

- `app/(tabs)/profile.tsx`
  - `components/GshGradientPrimaryButton.tsx` → `lib/theme.ts`
  - `components/CandidateReadinessSummary.tsx`
    - `lib/countries.ts`
    - `lib/i18n/useAccountCopy.ts` → Shared S1
    - `lib/i18n/index.ts` → Shared S1
    - `lib/candidate-readiness.ts` → `lib/countries.ts`
    - `lib/theme.ts`
  - `components/gsh-ui-kit.tsx`
    - `components/GshPressable.tsx`
    - `lib/screen-layout.ts`
    - `lib/theme.ts`
  - `components/GshScreenShell.tsx` → `lib/screen-layout.ts`, `lib/theme.ts`
  - `components/GshTabStickyHeader.tsx` → `lib/theme.ts`
  - `components/GshToolTile.tsx` → `lib/theme.ts`
  - `lib/i18n/useAccountCopy.ts` → Shared S1
  - `lib/i18n/index.ts` → Shared S1
  - `lib/api-client.ts` → Shared S2
  - `lib/auth-store.ts` → `types/models.ts`
  - `lib/job-preferences.ts`
  - `lib/profile-completion.ts` → `lib/i18n/catalog.ts` → Shared S1
  - `lib/skills-data.ts`
  - `lib/use-relocation-perks-nav.ts`
    - `lib/i18n/index.ts` → Shared S1
    - `lib/api-client.ts` → Shared S2
  - `lib/android-insets.ts`
  - `lib/theme.ts`

## 6. `/job/:id` — Job detail and apply

Entry: `app/job/[id].tsx`

- `app/job/[id].tsx`
  - `components/CompanyLogo.tsx` → `lib/theme.ts`
  - `components/CandidateCompatibilityCard.tsx`
    - `lib/i18n/index.ts` → Shared S1
    - `lib/match-copy.ts` → Shared S5
    - `lib/job-presentation.ts` → Shared S4
    - `lib/api-client.ts` → Shared S2
    - `lib/theme.ts`
  - `components/GshGradientPrimaryButton.tsx` → `lib/theme.ts`
  - `components/GshScreenBackground.tsx` → `lib/theme.ts`
  - `components/SkeletonLoader.tsx` → `lib/theme.ts`
  - `lib/i18n/index.ts` → Shared S1
  - `lib/i18n/catalog.ts` → Shared S1
  - `lib/job-presentation.ts` → Shared S4
  - `lib/api-client.ts` → Shared S2
  - `lib/auth-store.ts` → `types/models.ts`
  - `lib/candidate-readiness.ts` → `lib/countries.ts`
  - `lib/candidate-return-intent.ts` → `lib/api-client.ts` → Shared S2
  - `lib/haptics.ts`
  - `lib/idempotency.ts`
  - `lib/job-display.ts` → Shared S3
  - `lib/screen-layout.ts`
  - `lib/theme.ts`
  - `types/models.ts`

## 7. `/companies` — Company directory

Entry: `app/companies.tsx`

- `app/companies.tsx`
  - `components/GshDarkFeedHeading.tsx` → `lib/theme.ts`
  - `components/GshScreenShell.tsx` → `lib/screen-layout.ts`, `lib/theme.ts`
  - `lib/i18n/useAccountCopy.ts` → Shared S1
  - `lib/api-client.ts` → Shared S2
  - `lib/auth-store.ts` → `types/models.ts`
  - `lib/screen-layout.ts`
  - `lib/theme.ts`
  - `types/models.ts`

## 8. `/tools` — Career toolkit

Entry: `app/tools.tsx`

- `app/tools.tsx`
  - `components/gsh-ui-kit.tsx`
    - `components/GshPressable.tsx`
    - `lib/screen-layout.ts`
    - `lib/theme.ts`
  - `components/GshScreenBackground.tsx` → `lib/theme.ts`
  - `data/candidateToolkitCopy.json`
  - `lib/i18n/index.ts` → Shared S1
  - `lib/screen-layout.ts`
  - `lib/theme.ts`

## 9. `/visa-checker` — Sponsor checker soft gate

Entry: `app/visa-checker.tsx`

- `app/visa-checker.tsx`
  - `components/gsh-ui-kit.tsx`
    - `components/GshPressable.tsx`
    - `lib/screen-layout.ts`
    - `lib/theme.ts`
  - `components/GshScreenBackground.tsx` → `lib/theme.ts`
  - `data/candidateToolkitCopy.json`
  - `lib/i18n/index.ts` → Shared S1
  - `lib/screen-layout.ts`
  - `lib/theme.ts`

## 10. `/ats-assistant` — ATS assistant

Entry: `app/ats-assistant.tsx`

- `app/ats-assistant.tsx`
  - `components/GshGradientPrimaryButton.tsx` → `lib/theme.ts`
  - `components/gsh-ui-kit.tsx`
    - `components/GshPressable.tsx`
    - `lib/screen-layout.ts`
    - `lib/theme.ts`
  - `components/GshScreenBackground.tsx` → `lib/theme.ts`
  - `lib/api-client.ts` → Shared S2
  - `lib/i18n/index.ts` → Shared S1
  - `lib/i18n/catalog.ts` → Shared S1
  - `data/candidateCvReviewCopy.json`
  - `lib/screen-layout.ts`
  - `lib/theme.ts`

## Shared recursive subtrees

### S1 — Internationalization

- `lib/i18n/index.ts`
  - `lib/i18n/catalog.ts`
    - `lib/i18n/messages/en.json`
    - `lib/i18n/messages/fr.json`
    - `lib/i18n/messages/de.json`
    - `lib/i18n/messages/es.json`
    - `lib/i18n/messages/pt.json`
    - `lib/i18n/messages/it.json`
    - `lib/i18n/messages/nl.json`
    - `lib/i18n/messages/pl.json`
- `lib/i18n/useAccountCopy.ts`
  - `lib/i18n/index.ts`
  - `data/accountCopy.json`

### S2 — API client

- `lib/api-client.ts`
  - `lib/external-job-filters.ts`
  - `lib/config.ts`

### S3 — Job display

- `lib/job-display.ts`
  - `lib/i18n/catalog.ts` → S1 locale catalogs
  - `lib/brand-logo.ts`
    - `data/employerJobLogoOverrides.ts`
    - `lib/media-url.ts` → `lib/config.ts`
    - `types/models.ts`
  - `types/models.ts`

### S4 — Job presentation

- `lib/job-presentation.ts`
  - `lib/i18n/catalog.ts` → S1 locale catalogs
  - `data/countryGuideTranslations.json`

### S5 — Match copy

- `lib/match-copy.ts`
  - `lib/i18n/catalog.ts`
  - `lib/i18n/matching/en.json`
  - `lib/i18n/matching/fr.json`
  - `lib/i18n/matching/de.json`
  - `lib/i18n/matching/es.json`
  - `lib/i18n/matching/pt.json`
  - `lib/i18n/matching/it.json`
  - `lib/i18n/matching/nl.json`
  - `lib/i18n/matching/pl.json`

## Layout dependencies applying to these routes

- Every route is wrapped by `app/_layout.tsx`.
- Routes 1–5 are additionally wrapped by `app/(tabs)/_layout.tsx`.
- The layout dependency trees are intentionally kept in `layouts.md`; they should be added to a design payload only when the design target needs global/tab chrome.
