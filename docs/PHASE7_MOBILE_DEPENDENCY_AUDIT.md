# Phase 7 mobile dependency audit

Audit date: 2026-08-26.
Command: `npm audit --json`

## Result

The initial lockfile reported 34 vulnerable dependency entries: 2 critical, 17 high, 14 moderate, and 1 low. This count is npm's dependency-entry roll-up, not a claim that 34 vulnerabilities are remotely exploitable in the shipped app.

Expo diagnostics identified four SDK 54 patch mismatches. The compatible updates applied were Expo `54.0.37`, `expo-constants` `18.0.14`, `expo-font` `14.0.12`, and `expo-router` `6.0.24`. The refreshed audit reports 32 entries: 1 critical, 16 high, 14 moderate, and 1 low. In particular, the Expo CLI now resolves `tar@7.5.22`, removing the previously reported critical tar entry.

After those patches, `npm audit fix --package-lock-only --dry-run --json` still proposed 0 added, 0 removed, and 0 changed packages. Remaining npm remediations for the Expo-owned direct dependency entries require Expo 57, which is outside the Expo 54 compatibility boundary for this release. No force fix, override, or unrelated major upgrade was applied.

## Exposure

- Development tooling: the remaining critical `shell-quote` entry is `react-native@0.81.5 -> react-devtools-core@6.1.5 -> shell-quote@1.8.3`. The affected parser/quoting behavior is part of React Native developer tooling, not a mobile screen or backend request handler.
- Runtime-relevant content rendering: `react-native-markdown-display@7.0.2 -> markdown-it@10.0.0 -> linkify-it@2.2.0` has resource-consumption advisories for adversarial markdown/link text. This dependency is bundled and therefore has potential production relevance where untrusted or unusually large markdown is rendered. Existing API/content size bounds remain important; removal or replacement of this markdown stack should be handled as a focused compatibility change.
- The remaining high/moderate/low entries are predominantly transitive Expo CLI, Metro, config/prebuild, archive, websocket, YAML, PostCSS, and schema tooling. Their presence in npm's production dependency graph does not by itself establish a reachable mobile runtime path.

## Recommended upgrade path

1. Keep Expo 54 patched to its latest compatible patch and rerun `npx expo install --check`, `npx expo-doctor`, exports, and `npm audit --json`.
2. Upgrade to the next supported Expo SDK as a planned native release, using `npx expo install --fix` and device regression testing. Do not take npm's Expo 57 major suggestion in isolation.
3. Separately evaluate replacing or upgrading `react-native-markdown-display`; validate every screen that renders remote markdown and preserve input-size limits.
4. Re-run the audit after the Expo SDK and markdown changes, and assess reachability from actual app inputs rather than treating the aggregate count as exploitability.
