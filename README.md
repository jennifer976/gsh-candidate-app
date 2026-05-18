# Global Sponsor Hub — Candidate (React Native / Expo)

Native candidate app for **jobs**, **saved roles**, **apply**, and **profile**. It calls the same REST API as the web app (`/api/v1` on your configured API origin).

## Run locally

```bash
cd gsh-candidate-app
npm install --legacy-peer-deps
npx expo start
```

Then open in **Expo Go** (Android/iOS) or press `a` / `i` for emulators.

## Configuration

- Default API: `https://api.globalsponsorhub.com` (see `app.config.js` → `expo.extra.apiUrl`).
- Override: set `EXPO_PUBLIC_API_URL` to your API origin (no `/api/v1` suffix), or change `extra.apiUrl`.

## Phase 2 features

- **Applied** tab: list applications (`GET /applications`), open job, **withdraw** (`DELETE /applications/:id`).
- **Inbox** tab: employer conversations (`GET /messages/conversations`), thread + send (`POST …/messages`) — replies allowed after the employer’s first message (API rule).
- **Job alerts** (`/alerts` or banner on Jobs): notification email toggles (`PATCH /candidate/notification-prefs`), job matches, mark read / mark all read, saved searches (create / toggle / delete).
- **Profile**: edit core fields (`PUT /profile`), **CV upload** (`POST /uploads/file` then save `resume` URL).

## Store builds

Use [EAS Build](https://docs.expo.dev/build/introduction/) (`eas build`) for Play Store and App Store binaries. This repo is an MVP foundation; add icons, splash, analytics, and push before production release.

**Android package (Google Play):** `global.sponsor.hub` (`app.config.js` → `android.package`). iOS uses `com.globalsponsorhub.candidate` unless changed separately.

**Notes for future releases:**

- Play Console app must be registered with package name `global.sponsor.hub`. If you created the listing with a different ID, either use this build on the matching listing or create/fix the app entry in Play Console.
- **Push notifications (later):** If you add Firebase, register an Android app in Firebase with package `global.sponsor.hub` and add `google-services.json` to the Expo project.
- **Existing installs:** Changing the package ID is a new app on Play (users won’t get an in-place update from `com.globalsponsorhub.candidate`).

Full deploy steps: see `DEPLOY_PLAYBOOK.txt` → **BLOCK 3B** in the parent workspace folder.
