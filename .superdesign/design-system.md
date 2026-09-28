# Global Sponsor Hub Candidate App Design System

## Product context

Global Sponsor Hub is a native candidate app for finding sponsored work, saving roles, applying, messaging employers, completing a mobility profile, learning about destinations, and planning an international move. The product must feel like one cohesive premium app—not a marketing homepage attached to unrelated utility screens.

Primary home jobs-to-be-done:
- Search sponsored jobs quickly.
- Resume the most useful next action.
- Open saved roles and applications.
- Discover roles by destination or category.
- See relevant jobs and resume recent searches.
- Continue the most useful profile, application, or move-planning task.
- Discover country guides, practical resources, career tools, blog articles, and specialist help.
- Reach messages, notifications, alerts, and profile controls.

## Visual direction

- Native, app-first, bold, tactile, information-rich, and unmistakably branded.
- Use the supplied mobile reference for hierarchy and density, not as a literal clone.
- Draw structural inspiration from production patterns: Duolingo’s chunky progress, quests, rewards, and unmistakable color ownership; Deel’s contextual action modules and global-work utility; Glassdoor’s personalized next steps and job rails; Wanderlog’s editorial guide cards; Monarch’s progress checklist; and Grab’s layout-matched skeletons.
- Keep Global Sponsor Hub identity: navy, cyan, white, Montserrat headings, and Inter body copy.
- Follow the website’s actual visual DNA: poster-scale Montserrat, navy blocks with cyan type, pill searches, cyan action buttons, the official walking-professional artwork, and flowing cyan network geometry.
- Cyan is a dominant branded surface—not merely a small accent. Use large cyan hero fields, cyan progress modules, cyan selected states, and cyan section bands balanced by navy and white.
- Use a pale app canvas with bold cyan/navy modules, white elevated content, navy text, and image-led discovery cards.
- Cyan is the only accent. Do not copy Duolingo’s rainbow palette or Deel’s lavender; borrow their interaction logic while keeping GSH navy/cyan.
- Avoid a desktop-dashboard feel: no oversized analytic panels, dense tables, or long explanatory sections on Home.
- Do not include an expert relocation-support promotional banner.
- Avoid dead space: every feed ends with useful content and a compact final action, followed by only the minimum safe-area clearance.
- Use one visual language throughout Home, Jobs, Saved, Applications, Messages, Profile, Guides, Tools, Blog, and loading/error/empty states.

## Home screen structure

1. Safe-area app bar with the exact GSH logo, notification control, and candidate avatar/profile shortcut.
2. Compact personalized greeting and a shorter, premium headline so useful content remains visible above the fold.
3. Persistent high-emphasis search control with recent-search affordance.
4. Personalized “Your next step” progress module: profile completion, unread matches, saved search, or application follow-up. It must be interactive, not decorative.
5. “Jobs for you” rail with 2–3 cards, save affordances, mobility labels, and a clear “See all”.
6. “Jump back in” quick actions for Saved, Applications, Alerts, and Messages.
7. “Plan your move” utility rail containing Country guides, Compare countries, Move worksheets, Currency converter, Specialist requests, and Partner offers.
8. Popular destinations image rail with partial-next-card affordance and a “See all” action.
9. “Learn and prepare” editorial rail showing latest blog imagery plus practical resources such as CV quality check, ATS assistant, sponsorship cover letter, and scam checklist.
10. Compact job-category chips for Relocation, Remote, Tech, Healthcare, and Engineering.
11. A compact closing action to open the full Tools & Resources hub—never a large promotional banner.
12. Persistent native bottom navigation: Home, Jobs, Saved, Messages, Profile.

Application and matching features remain available through cards, badges, alerts, and secondary screens even when Applications is no longer a primary tab.

## Cross-app cohesion

- All primary tabs use the same cyan/navy branded app bar or cyan header field, section-header pattern, card radius, icon wells, badge language, progress geometry, and spacing rhythm.
- Inner hubs (Guides, Tools, Blog, Resources) use the same app bar and card system; navy hero bands may be used only as short section anchors.
- Lists use dividers or grouped cards—not an inconsistent mix of dark feeds, outlined marketing cards, and large empty canvases.
- Profile is a task-based account hub first and an editor second: progress, next actions, tools, and settings precede long forms.
- Every route provides a useful empty state with a next action and every error state offers retry plus a safe alternate destination.

## Color tokens

- Navy: `#0d194e`
- Deep navy: `#070d2c`
- Cyan: `#42e0e3`
- White: `#ffffff`
- Pale canvas: `#f4f7fb`
- Muted surface: `#eef3f8`
- Primary text: `#0d194e`
- Secondary text: `#475569`
- Muted text: `#64748b`
- Border: `#e2e8f0`
- Error: `#b91c1c`

## Typography

- Headings: Montserrat 700/800.
- Body and controls: Inter 400/500/600/700.
- Home headline: 32–38px equivalent on a 390px-wide device, tight line-height and tracking; it must not consume the entire first viewport.
- Section headings: 18–22px Montserrat 700.
- Body: 14–16px Inter.
- Small labels: 10–12px Inter 600/700.

## Spacing and geometry

- Base horizontal inset: 16px.
- Use an 8px spacing rhythm, with 12px gaps for compact rails.
- Touch targets must be at least 44×44.
- Cards: 16–22px radius with a single consistent family.
- Search control and primary actions: pill radius.
- Destination cards: approximately 136–152px wide, 128–148px tall.
- Quick actions: equal-width cards in one row on phone layouts.
- Bottom navigation respects iOS and Android safe areas.

## Surface and depth

- Prefer white cards on the pale canvas with subtle borders and a restrained shadow for featured modules.
- Use only restrained native shadow on search, featured cards, sheets, and elevated app chrome.
- Avoid heavy glassmorphism, neon glow, and deep multi-layer shadows.
- Destination photos use a dark bottom scrim for accessible white labels.

## Iconography and imagery

- Use the existing Ionicons/SF Symbols already present in the app.
- Use the exact supplied Global Sponsor Hub logo in every logo position; never replace it with initials, emoji, an invented mark, or text alone.
- Destination imagery should be recognizable, crop well in portrait cards, and include accessible contrast.
- The official website walking-professional artwork is the preferred Home visual anchor. Do not substitute generic stock imagery when it is available.
- Reuse the website’s cyan network/blob geometry as background crops and progress-route motifs.

## Interaction and motion

- Keep existing light haptics and subtle press-scale feedback.
- Use short 180–260ms transitions.
- Respect reduced-motion settings.
- Horizontal rails should snap softly and show a partial next card as an affordance.
- Add interactive states: save/unsave, expandable next steps, progress completion, filter chips, recent searches, carousels, pull to refresh, retry, and contextual badges.
- Introduce a professional GSH “move momentum” system inspired by quests: profile progress, weekly application activity, saved-job goals, and move-planning steps. Do not add a cartoon mascot, fake points economy, or childish copy.
- Use chunky controls with subtle bottom depth, satisfying completion states, animated progress fills, haptics, and celebratory cyan pulses when a real task completes.
- Loading states must use skeleton shapes matching the actual destination cards, job cards, progress module, and editorial cards. Do not replace the whole screen with a centered spinner.
- Image loading should use a pale placeholder and cross-fade where supported.
- Avoid autoplay, looping decorative motion, and large entrance choreography.

## Accessibility and responsive behavior

- Maintain WCAG AA text contrast.
- Preserve dynamic type resilience and two-line truncation where needed.
- Provide accessible names for icon-only actions.
- Keep tablet content centered with the existing 720px maximum width.
- Support iOS native tabs and Android JavaScript tabs without changing platform-specific behavior.

## Hard constraints

- Preserve existing data fetching, routes, localization, loading/error states, and analytics behavior.
- Do not remove applications, alerts, notifications, or profile-readiness functionality.
- Do not add an expert relocation-support banner.
- Use only the fonts, colors, spacing, and component styles defined here and in `lib/theme.ts`.
