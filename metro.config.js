// Expo Doctor expects Metro to extend Expo's default config.
// We intentionally keep this config minimal to avoid surprising Metro behavior.
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);

