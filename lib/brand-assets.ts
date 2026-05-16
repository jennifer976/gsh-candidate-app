/**
 * Central brand imagery.
 * - `brandLockupLight`: horizontal lockup for dark gradients (transparent PNG — white + cyan; never tint).
 * - `brandMarkLight`: hub mark only — compact headers / icons on dark (`Discover` hero).
 * - `brandLogo` / `brandLogoWhite` / `brandLogoStacked`: legacy raster lockups for light surfaces & older screens.
 * - Native Expo splash is plain white (`splash-transparent.png` + `#ffffff`) until the app shell loads.
 * - `brandMark`: legacy `.webp` mark (prefer `brandMarkLight` on navy).
 */
export const brandLockupLight = require("../assets/brand-lockup-light.png");
export const brandMarkLight = require("../assets/brand-mark-light.png");
export const brandLogo = require("../assets/brand-logo.png");
export const brandLogoWhite = require("../assets/brand-logo-white.png");
export const brandLogoStacked = require("../assets/brand-logo-stacked.png");
export const brandMark = require("../assets/brand-mark.webp");
