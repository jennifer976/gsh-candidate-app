import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const createConfig = require("../app.config.js");

const original = {
  variant: process.env.GSH_APP_VARIANT,
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  siteUrl: process.env.EXPO_PUBLIC_SITE_URL,
};

function restore(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

try {
  process.env.GSH_APP_VARIANT = "staging";
  process.env.EXPO_PUBLIC_API_URL = "https://api-staging.example.test";
  process.env.EXPO_PUBLIC_SITE_URL = "https://web-staging.example.test";

  const staging = createConfig().expo;
  const errors = [];

  if (staging.name !== "Global Sponsor Hub Staging") {
    errors.push("staging app name is not distinct");
  }
  if (staging.scheme !== "gsh-candidate-staging") {
    errors.push("staging URL scheme is not distinct");
  }
  if (staging.ios?.bundleIdentifier !== "com.globalsponsorhub.candidate.staging") {
    errors.push("staging iOS bundle identifier is not distinct");
  }
  if ((staging.ios?.associatedDomains ?? []).length !== 0) {
    errors.push("staging iOS build must not claim production associated domains");
  }
  if (staging.android?.package !== "global.sponsor.hub.staging") {
    errors.push("staging Android package is not distinct");
  }
  if ((staging.android?.intentFilters ?? []).length !== 0) {
    errors.push("staging Android build must not claim production app links");
  }
  if (staging.extra?.apiUrl !== process.env.EXPO_PUBLIC_API_URL) {
    errors.push("staging API environment override was not applied");
  }
  if (staging.extra?.siteUrl !== process.env.EXPO_PUBLIC_SITE_URL) {
    errors.push("staging site environment override was not applied");
  }

  delete process.env.GSH_APP_VARIANT;
  delete process.env.EXPO_PUBLIC_API_URL;
  delete process.env.EXPO_PUBLIC_SITE_URL;
  const production = createConfig().expo;
  if (production.ios?.bundleIdentifier !== "com.globalsponsorhub.candidate") {
    errors.push("production iOS bundle identifier drifted");
  }
  if (production.android?.package !== "global.sponsor.hub") {
    errors.push("production Android package drifted");
  }
  if ((production.ios?.associatedDomains ?? []).length === 0) {
    errors.push("production associated domains are missing");
  }
  if ((production.android?.intentFilters ?? []).length === 0) {
    errors.push("production Android app links are missing");
  }

  if (errors.length > 0) {
    console.error(`Staging app configuration failed:\n- ${errors.join("\n- ")}`);
    process.exitCode = 1;
  } else {
    console.log(
      "Staging app configuration valid: distinct identifiers, no production app-link claims, and environment URL overrides applied.",
    );
  }
} finally {
  restore("GSH_APP_VARIANT", original.variant);
  restore("EXPO_PUBLIC_API_URL", original.apiUrl);
  restore("EXPO_PUBLIC_SITE_URL", original.siteUrl);
}
