# Extractable reusable components

Only cross-route patterns and stable primitives are included. Page-local cards are omitted unless they already represent a repeated product pattern.

## Layout components

## RootLayout
- Source: `app/_layout.tsx`
- Category: layout
- Description: Global provider shell, launch/auth gate, and native stack configuration.
- Extractable props: none; app-level state is sourced from stores/providers.
- Hardcoded: Safe-area/query providers, branded launch splash, stack route registrations, navy header theme, font assets.

## TabsLayout
- Source: `app/(tabs)/_layout.tsx`
- Category: layout
- Description: Five-destination authenticated tab navigation with iOS-native and Android JavaScript implementations.
- Extractable props: active tab (router-owned), `matchesCount`, `notifCount`, `unreadMessages`, onboarding visibility.
- Hardcoded: Home/Jobs/Applications/Messages/Profile destinations; Ionicon and SF Symbol names; hidden legacy tabs; platform split; cyan badge styling.

## GshScreenShell
- Source: `components/GshScreenShell.tsx`
- Category: layout
- Description: Full-height light/navy screen canvas with optional tablet-width constraint.
- Extractable props: `variant`, `constrainTabletWidth`, `style`, `children`.
- Hardcoded: 600px wide-screen breakpoint, 720px maximum content width, white/navy surface colors.

## GshScreenBackground
- Source: `components/GshScreenBackground.tsx`
- Category: layout
- Description: Minimal white full-height screen wrapper for stack screens.
- Extractable props: `style`, `children`.
- Hardcoded: white background and flex fill.

## GshTabStickyHeader
- Source: `components/GshTabStickyHeader.tsx`
- Category: layout
- Description: Sticky large-title header shared by Jobs, Applications, Messages, and Profile.
- Extractable props: `title`, `subtitle`, `paddingTop`, `brandWash`, `children`.
- Hardcoded: cyan-to-pale gradient, 34px Montserrat title, pale canvas, bottom hairline.

## GshTabHeroHeader
- Source: `components/GshTabHeroHeader.tsx`
- Category: layout
- Description: Branded tab hero with logo, notification/message actions, optional tagline, and light/navy tones.
- Extractable props: `paddingTop`, `tagline`, `tone`, `children`, unread counts if decoupled from queries.
- Hardcoded: GSH lockup assets, notification and chat routes/icons, wash geometry, uppercase tagline treatment.

## GshHeroWash
- Source: `components/GshHeroWash.tsx`
- Category: layout
- Description: Light or cyan-brand vertical hero gradient container.
- Extractable props: `tone`, `style`, `children`.
- Hardcoded: gradient colors, locations, and vertical direction.

## GshDarkFeedHeading
- Source: `components/GshDarkFeedHeading.tsx`
- Category: layout
- Description: Shared section/page heading with optional subtitle and action.
- Extractable props: `title`, `subtitle`, `actionLabel`, `onAction`, `pageLead`, `inFeedGroup`.
- Hardcoded: title typography, spacing presets, action placement and color.

## Basic components

## GshPressable
- Source: `components/GshPressable.tsx`
- Category: basic
- Description: Animated pressable with spring scale and optional native haptic feedback.
- Extractable props: `pressScale`, `haptic`, `disabled`, standard `PressableProps`, `children`.
- Hardcoded: spring damping/stiffness, web haptic suppression, default scale `0.985`.

## GshGradientPrimaryButton
- Source: `components/GshGradientPrimaryButton.tsx`
- Category: basic
- Description: Pill primary CTA with navy/cyan tones, loading state, haptic press, and spring feedback.
- Extractable props: `title`, `tone`, `onPress`, `disabled`, `loading`, `containerStyle`.
- Hardcoded: 52px minimum height, pill radius, font size, spring values, activity indicator colors.

## GshChromeIconButton
- Source: `components/GshChromeIconButton.tsx`
- Category: basic
- Description: Circular chrome action with icon, light/navy tone, and unread badge.
- Extractable props: `icon`, `onPress`, `accessibilityLabel`, `badgeCount`, `tone`.
- Hardcoded: 44px circle, 22px icon, cyan 18px badge, `99+` cap.

## GshScreenIntro
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Eyebrow, title, and optional subtitle introduction block.
- Extractable props: `eyebrow`, `title`, `subtitle`, `underStackHeader`, `style`.
- Hardcoded: lowercase cyan eyebrow, 26px heading, stack-header body gap.

## GshSectionTitle
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Section heading with cyan rule, optional hint, and optional action.
- Extractable props: `title`, `hint`, `actionLabel`, `onAction`, `topSpacing`, `onDark`.
- Hardcoded: 4×20 cyan rule, spacing presets, navy/white title tones.

## GshLinkRow
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Card-like navigation row with icon tile, text, and trailing chevron.
- Extractable props: `title`, `subtitle`, `icon`, `accent`, `onPress`.
- Hardcoded: chevron icon, 44px icon tile, card surface, accent palette mapping.

## GshNavyHeroCard
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Navy rounded hero card with badge, title, body slot, and footer slot.
- Extractable props: `badge`, `title`, `children`, `footer`.
- Hardcoded: default badge “Global Sponsor Hub”, navy surface, white typography, 24px radius.

## GshMessengerTip
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Muted informational strip with chat icon.
- Extractable props: text `children`.
- Hardcoded: chatbubble icon, muted surface, 24px icon, card border.

## GshCompletionStrip
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Profile completion percentage and progress track.
- Extractable props: `pct`.
- Hardcoded: “Profile completion”, completion encouragement copy, cyan progress fill.

## GshOutlineButton
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Full-width outlined pill action.
- Extractable props: `title`, `onPress`, `style`.
- Hardcoded: navy border/text, 48px minimum height, pill radius.

## GshFilterChip
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Selectable filter pill with accessibility selected state.
- Extractable props: `label`, `active`, `onPress`.
- Hardcoded: white inactive and cyan-soft active surfaces, 44px minimum hit target.

## GshTopicChip
- Source: `components/gsh-ui-kit.tsx`
- Category: basic
- Description: Compact destination/topic navigation pill.
- Extractable props: `label`, `onPress`.
- Hardcoded: bordered white surface and navy label.

## GshEmptyState
- Source: `components/GshEmptyState.tsx`
- Category: basic
- Description: Branded/icon empty state with title and primary action.
- Extractable props: `icon`, `title`, `actionLabel`, `onAction`, `useBrandMark`.
- Hardcoded: GSH mark asset option, 72px icon circle, navy pill CTA.

## CountryPicker
- Source: `components/CountryPicker.tsx`
- Category: basic
- Description: Searchable single/multi-country field with localized region labels and removable selections.
- Extractable props: `label`, `hint`, `value`, `onChange`, `multiple`.
- Hardcoded: 12-result cap, country option dataset, inline remove/search/list styles, localized helper strings.

## CompanyLogo
- Source: `components/CompanyLogo.tsx`
- Category: basic
- Description: Remote company logo with deterministic letter-avatar fallback.
- Extractable props: `logoUrl`, `companyName`, `size`, `radius`.
- Hardcoded: two fallback palettes, 4px image inset, initial-derived font sizing.

## SkeletonBox
- Source: `components/SkeletonLoader.tsx`
- Category: basic
- Description: Animated opacity shimmer bone used to construct loading placeholders.
- Extractable props: `width`, `height`, `radius`, `style`.
- Hardcoded: 1200ms sine timing, border-color fill, repeating reverse animation.

## JobCardSkeleton
- Source: `components/SkeletonLoader.tsx`
- Category: basic
- Description: Loading skeleton matching the Hub job-card geometry.
- Extractable props: none.
- Hardcoded: logo, title/meta, chip, and footer bone dimensions.

## GshSheetGrabber
- Source: `components/GshSheetGrabber.tsx`
- Category: basic
- Description: iOS-style visual affordance for page sheets.
- Extractable props: none.
- Hardcoded: 36×5 border-strong pill and top/bottom spacing.

## GshSwipeAction
- Source: `components/GshSwipeAction.tsx`
- Category: basic
- Description: Native-only leading/trailing swipe action wrapper.
- Extractable props: `leftActions`, `rightActions`, `enabled`, `children`; each action exposes `label`, `onPress`, and `tone`.
- Hardcoded: web fallback, 88px action width, navy/red tones, medium haptic, friction values.

## GshToolTile
- Source: `components/GshToolTile.tsx`
- Category: basic
- Description: Two-column utility tile with icon bubble and centered label.
- Extractable props: `label`, `icon`, `accent`, `onPress`.
- Hardcoded: tile sizing, three accent aliases mapped to cyan/neutral visual lanes, 36px icon bubble.
