# Global Sponsor Hub candidate app design system

The app follows the website's design system. It should feel calm, premium and clearly Global Sponsor Hub. It is not a game.

## Colour
- Navy #0d194e: main text, primary buttons, selected states, navy sections.
- Cyan #42e0e3: accent only, about 10% of any screen at most. Use it for dots, the short line before small labels, focus rings, progress bars, the full stop after headings and badges on navy. Never a screen, hero, card, band or button fill on white.
- Text 2 #515a80: secondary and body text on white.
- Muted #8a93ad: placeholders, meta and inactive tab icons only.
- Heading tone #646d93: the second half of a two-tone heading.
- Mark grey #dfe3ec: the large Global Sponsor Hub logo mark behind the Welcome walker and on the Home hero card.
- Border #e6e9f1 (1px). Strong border rgba(13,25,78,0.24).
- Panel #f3f5f9: screen background behind cards, tiles, search pills.
- White #ffffff: cards.
- Error #b91c1c, form errors only, with an alert icon.
- On navy: white text, 72% white for secondary text, 14% white for dividers, the mark at 5% white.
- No green, amber, rose, purple, teal tints or a second navy.

## Shape and depth
- Radii: 8, 12, 16, 24 and pill. 28 only for the Home hero card, the profile card and the bottom sheet top corners.
- Cards: white, radius 24, no border, soft shadow (navy at 7%, 6px down, 20px blur). Lifted cards (photo cards, floating stat cards): navy at 14 to 22%, 14px down, 36px blur.
- Inputs: white, 1px #e6e9f1, radius 16, height 52. Focus: navy border plus a 3px navy ring at 8%.
- No outlines plus thick bottom edges, no slabs, no decorative rings, no ghost watermark words, no gradients except the photo scrims.

## Type
- Montserrat 800 for screen titles: 34/36, letter spacing -0.035em, navy, followed by a cyan full stop.
- Montserrat 800 for section headings: 21/26, -0.03em.
- Montserrat 700 for card titles: 17/22.
- Inter 400 15/22 body, Inter 600 for labels, buttons and chips.
- Small labels: Inter 600 13/18 #515a80 in sentence case, with a 20 x 2 cyan line before them.
- Two-tone headings: navy, then #646d93 for the second half, for example "Where would you" / "like to work?".
- Sentence case everywhere. The only capitals lockup is "TALENT MOVES." on Welcome.

## The TALENT MOVES. lockup (Welcome only)
- Text "Talent moves." shown in capitals, Montserrat 800, letter spacing -0.035em, line height 0.9 of the font size.
- Line 1 "TALENT" in navy. Line 2 "MOVES" in white inside a navy box with corner radius 0.192em and padding 0.058em top, 0.192em sides, 0.135em bottom, then a cyan full stop inside the box.
- Font size 66 on a 390-wide phone. Screen readers read "Talent moves."

## Chips and tags
- Support chip (Visa sponsorship, Relocation support): height 28, pill, background rgba(66,224,227,0.2), Inter 600 12 navy, a 6px cyan dot before the text.
- Plain tag (Remote, Full time): same size, background #f3f5f9, no dot.
- Filter chip: 44 high, pill. Off: white, 1px #e6e9f1, navy text. On: navy fill, white text.

## Photos
- Only the website's own photos, bundled in the app. Never AI images or stock photos.
- Country cards use the same photo the website's /countries page uses. Flags are round, 28px, with a 2px white ring.
- Layered cards: a photo can break the top edge of a navy card, rotated 2 to 5 degrees, with a white 3px border and a floating white stat chip.

## Motion
- Ease cubic-bezier(0.2, 0.8, 0.2, 1). Rise-in 700ms (fade plus 18px up), staggered 80 to 120ms. Count-ups 1.1s. Press scale 0.97. Heart bounce. Sheets slide up.
- When the phone's reduce motion setting is on, nothing moves: show final values straight away.
