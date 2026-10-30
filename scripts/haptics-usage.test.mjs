/**
 * Pack 27 calm-haptics guardrails.
 * Fails if:
 * - any file outside lib/haptics.ts imports expo-haptics or uses Vibration from react-native
 * - hapticConfirm( is called outside allowed files
 * - hapticLight(/Medium(/Success(/Warning(/Error( are still called anywhere
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ALLOWED_CONFIRM = [
  /(?:^|[/\\])job[/\\]\[id\]\.tsx$/,
  /(?:^|[/\\])V3JobCard\.tsx$/,
  /(?:^|[/\\])JobCard\.tsx$/,
  /(?:^|[/\\])jobs\.tsx$/, // HubJobCard bookmark save
  /(?:^|[/\\])CandidateHomeScreen\.tsx$/,
  /(?:^|[/\\])saved\.tsx$/,
  /(?:^|[/\\])onboarding[/\\]\[step\]\.tsx$/,
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === "node_modules" || name.name === ".git") continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(name.name)) out.push(full);
  }
  return out;
}

const files = walk(root).filter((f) => !f.includes(`${path.sep}node_modules${path.sep}`));
const errors = [];

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (rel === "lib/haptics.ts") continue;
  if (rel.startsWith("scripts/")) continue;
  const source = fs.readFileSync(file, "utf8");

  if (/from\s+["']expo-haptics["']/.test(source) || /require\(\s*["']expo-haptics["']\s*\)/.test(source)) {
    errors.push(`${rel}: imports expo-haptics (only lib/haptics.ts may)`);
  }

  if (
    /(?:import\s*\{[^}]*\bVibration\b[^}]*\}\s*from\s*["']react-native["']|\bVibration\.(?:vibrate|cancel)\s*\()/.test(
      source,
    )
  ) {
    errors.push(`${rel}: uses react-native Vibration`);
  }

  if (/hapticConfirm\s*\(/.test(source)) {
    if (!ALLOWED_CONFIRM.some((re) => re.test(file))) {
      errors.push(`${rel}: hapticConfirm( is not allowed here`);
    }
  }

  for (const name of ["hapticLight", "hapticMedium", "hapticSuccess", "hapticWarning", "hapticError"]) {
    // Match calls only, not export declarations
    const callRe = new RegExp(String.raw`\b${name}\s*\(`);
    if (callRe.test(source)) {
      errors.push(`${rel}: ${name}( must not be called (no-op stubs only)`);
    }
  }
}

if (errors.length) {
  console.error("haptics-usage.test failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("haptics-usage.test: ok");
process.exit(0);
