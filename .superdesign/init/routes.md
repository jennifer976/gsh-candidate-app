# Route map

## Router and layout model

- Framework: Expo SDK 54, React Native 0.81, React 19.
- Router: Expo Router 6 file-based routing (`main: expo-router/entry`).
- Root layout: `app/_layout.tsx` — providers, launch/auth gate, global `Stack`, navy native headers.
- Authenticated tabs layout: `app/(tabs)/_layout.tsx` — iOS `NativeTabs`; Android/web JavaScript `Tabs`; onboarding gate.
- Nested stacks: `app/guides/_layout.tsx`, `app/blog/_layout.tsx`, and `app/legal/_layout.tsx`.
- Route groups such as `(tabs)` do not appear in public URLs. The explicit group form, e.g. `/(tabs)/home`, is also used internally for unambiguous navigation.
- Dynamic segments use Expo Router bracket syntax.

## Entry and tab routes

| URL | File | Layout | Summary |
|---|---|---|---|
| `/` | `app/index.tsx` | Root stack | Redirects authenticated users to Home and guests to Login. |
| `/(tabs)` | `app/(tabs)/index.tsx` | Root + tabs | Redirects to the Home tab. |
| `/home` (`/(tabs)/home`) | `app/(tabs)/home.tsx` | Root + tabs | Candidate command centre: status, profile readiness, job preview, destinations, mission banner, and notification/message chrome. |
| `/jobs` (`/(tabs)/jobs`) | `app/(tabs)/jobs.tsx` | Root + tabs | Searchable, filterable Hub and curated job feed with save/swipe actions. |
| `/applications` (`/(tabs)/applications`) | `app/(tabs)/applications.tsx` | Root + tabs | Application status feed and withdrawal actions. |
| `/messages` (`/(tabs)/messages`) | `app/(tabs)/messages.tsx` | Root + tabs | Conversation inbox. |
| `/profile` (`/(tabs)/profile`) | `app/(tabs)/profile.tsx` | Root + tabs | Candidate profile editor, readiness, CV upload, preferences, skills, and tools. |
| `/saved` (`/(tabs)/saved`) | `app/(tabs)/saved.tsx` | Root + tabs, hidden tab | Saved-role list. |
| `/more` (`/(tabs)/more`) | `app/(tabs)/more.tsx` | Root + tabs, hidden tab | Legacy/secondary tab route. |

## Root stack routes

| URL | File | Layout / header |
|---|---|---|
| `/login` | `app/login.tsx` | Root; header hidden |
| `/register` | `app/register.tsx` | Root stack |
| `/verify` | `app/verify.tsx` | Root stack |
| `/forgot-password` | `app/forgot-password.tsx` | Root modal |
| `/reset-password` | `app/reset-password.tsx` | Root modal |
| `/dashboard` | `app/dashboard.tsx` | Root stack; redirects to Home |
| `/job/:id` | `app/job/[id].tsx` | Root stack; job detail header |
| `/external-job/:id` | `app/external-job/[id].tsx` | Root stack |
| `/curated-listings` | `app/curated-listings.tsx` | Root stack |
| `/alerts` | `app/alerts.tsx` | Root stack |
| `/conversation/:id` | `app/conversation/[id].tsx` | Root stack |
| `/notification-feed` | `app/notification-feed.tsx` | Root stack |
| `/saved` | `app/saved.tsx` | Root stack |
| `/application-tracker` | `app/application-tracker.tsx` | Root stack |
| `/offers` | `app/offers.tsx` | Root stack |
| `/settings` | `app/settings.tsx` | Root stack |
| `/feedback` | `app/feedback.tsx` | Root stack |
| `/mobility-profile` | `app/mobility-profile.tsx` | Root stack |
| `/profile-extraction-review` | `app/profile-extraction-review.tsx` | Root stack |
| `/relocation-help` | `app/relocation-help.tsx` | Root stack |
| `/relocation-help/:id` | `app/relocation-help/[id].tsx` | Root stack |
| `/agency-introductions` | `app/agency-introductions.tsx` | Root stack |
| `/agency-introductions/:id` | `app/agency-introductions/[id].tsx` | Root stack |
| `/partners` | `app/partners.tsx` | Root stack |
| `/partner/:id` | `app/partner/[id].tsx` | Root stack |
| `/companies` | `app/companies.tsx` | Root stack |
| `/company/:slug` | `app/company/[slug].tsx` | Root stack |
| `/company/employer/:id` | `app/company/employer/[id].tsx` | Root stack |
| `/employer-follows` | `app/employer-follows.tsx` | Root stack |
| `/resources` | `app/resources.tsx` | Root stack |
| `/saved-resources` | `app/saved-resources.tsx` | Root stack |
| `/tools` | `app/tools.tsx` | Root stack |
| `/tools-resources` | `app/tools-resources.tsx` | Root stack |
| `/ats-assistant` | `app/ats-assistant.tsx` | Root stack |
| `/visa-wizard` | `app/visa-wizard.tsx` | Root stack |
| `/visa-checker` | `app/visa-checker.tsx` | Root stack |
| `/relocation-worksheets` | `app/relocation-worksheets.tsx` | Root stack |
| `/currency-converter` | `app/currency-converter.tsx` | Root stack |
| `/compare-countries` | `app/compare-countries.tsx` | Root stack |
| `/news` | `app/news.tsx` | Root stack |
| `/faq` | `app/faq.tsx` | Root stack |
| `/contact` | `app/contact.tsx` | Root stack |
| `/learn` | `app/learn.tsx` | Root; header hidden |
| `/web-fallback` | `app/web-fallback.tsx` | Root; header hidden |
| `/ui-preview` | `app/ui-preview.tsx` | Root; header hidden, internal preview |

## Nested stack routes

| URL | File | Layout |
|---|---|---|
| `/guides` | `app/guides/index.tsx` | `app/guides/_layout.tsx` |
| `/guides/topic` | `app/guides/topic.tsx` | Guides stack |
| `/guides/country/:slug` | `app/guides/country/[slug].tsx` | Guides stack |
| `/blog` | `app/blog/index.tsx` | `app/blog/_layout.tsx` |
| `/blog/:slug` | `app/blog/[slug].tsx` | Blog stack |
| `/legal` | `app/legal/index.tsx` | `app/legal/_layout.tsx` |
| `/legal/:slug` | `app/legal/[slug].tsx` | Legal stack |

## Special Expo Router files

| File | Role |
|---|---|
| `app/+not-found.tsx` | Unmatched-route screen. |
| `app/+native-intent.tsx` | Resolves incoming native/deep-link paths through public-route parity rules. |

## Key navigation configuration

There is no separate router configuration file. Route discovery is filesystem-based. Screen titles, header visibility, modal presentation, and the global `navHeader` are configured in `app/_layout.tsx`; tab visibility, icons, labels, badges, and platform-specific tab implementations are configured in `app/(tabs)/_layout.tsx`.
