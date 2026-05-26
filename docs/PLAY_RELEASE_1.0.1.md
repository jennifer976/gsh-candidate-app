# Google Play release 1.0.1

Addresses Play Console feedback from **1.0.0** (SDK 35 edge-to-edge, deprecated APIs, large-screen/orientation).

## What changed

| Area | Change |
|------|--------|
| **Version** | `1.0.1` in `app.config.js` + `package.json`; EAS `production` auto-increments `versionCode` |
| **Edge-to-edge** | Removed deprecated `android.edgeToEdgeEnabled`; use `androidStatusBar` / `androidNavigationBar` in config + runtime `AndroidSystemUiBootstrap` (`expo-navigation-bar`, translucent `StatusBar`) |
| **Tab bar** | `tabBarBottomPadding()` uses safe-area bottom inset on Android 15+ |
| **Tablets** | `GshScreenShell constrainTabletWidth` on main tab feeds (max 720px centered); portrait lock kept — test on tablet emulator (Android 16 may allow rotation on large screens) |

## Pre-build checklist

- [ ] API at `92f2155+` deployed if testing **saved jobs** / curated cards
- [ ] `.env` / EAS secrets: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SITE_URL`, Supabase keys, registration key
- [ ] `npm ci` && `npx tsc --noEmit` in `gsh-candidate-app`

## Build & submit

From `gsh-candidate-app` (see root `DEPLOY_PLAYBOOK.txt` BLOCK 3B):

```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

## Play Console — release notes (suggested)

- Jobs and Home UI improvements; saved jobs list fix (with API update)
- Better curated job previews; employer logos on more listings
- Android 15+ display and tablet layout improvements

## Device test matrix (before promote to production)

| Device / form factor | Checks |
|----------------------|--------|
| Phone (gesture nav) | Tab bar not clipped; status bar readable on Home/Jobs |
| Phone (3-button nav) | Same |
| Tablet or 7"+ emulator | Feeds centered; no huge empty side gutters breaking taps |
| Dark shell screens | Messages empty state readable |

## Play policy notes

- **Edge-to-edge**: mandatory on SDK 54; do not re-add `edgeToEdgeEnabled`.
- **Orientation**: `orientation: "portrait"` remains; if Play still flags large-screen restrictions, consider `supportsTablet` layouts or document phone-first UX in store listing.

## Changelog entry

| Date | Version | Note |
|------|---------|------|
| 2026-05-26 | 1.0.1 | Play SDK 35 edge-to-edge, tab insets, tablet width, UI parity from 1.0.0 feedback |
