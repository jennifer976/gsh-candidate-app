import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = JSON.parse(readFileSync(join(root, "scripts", "fixtures", "phase7-contracts.json"), "utf8"));
const errors = [];
const source = (path) => readFileSync(join(root, path), "utf8");

for (const route of fixtures.candidateRoutes) {
  if (!existsSync(join(root, "app", ...route.split("/")))) errors.push(`missing candidate route: ${route}`);
}

const api = source("lib/api-client.ts");
for (const path of fixtures.requiredApiPaths) {
  if (!api.includes(path)) errors.push(`missing API mapping: ${path}`);
}

const compatibility = source("lib/compatibility.ts");
if (!compatibility.includes(`COMPATIBILITY_BATCH_MAX = ${fixtures.compatibilityBatchMaximum}`)) {
  errors.push("compatibility batch maximum drifted from backend contract");
}
if (!compatibility.includes("no roles are hidden") && !source("app/(tabs)/jobs.tsx").includes("no roles are hidden")) {
  errors.push("compatibility-first ordering must state that it hides nothing");
}

const normalize = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const aliases = {
  unitedkingdom: "GB", uk: "GB", unitedstatesofamerica: "US", ae: "AE", southkorea: "KR",
};
for (const [input, expected] of fixtures.countryInputs) {
  const actual = aliases[normalize(input)] || (input.length === 2 ? input.toUpperCase() : undefined);
  if (actual !== expected) errors.push(`country fixture failed: ${input} -> ${actual}, expected ${expected}`);
}

const extraction = source("app/profile-extraction-review.tsx");
const extractionTypes = source("types/candidate-extraction.ts");
if (!extractionTypes.includes(`"${fixtures.extraction.contractVersion}"`)) {
  errors.push("candidate extraction contract version drifted");
}
for (const field of fixtures.extraction.allowedFields) {
  if (!extractionTypes.includes(`"${field}"`)) errors.push(`missing allowed extraction field: ${field}`);
}
const backendExtractionContract = resolve(root, "..", "backend", "src", "domain", "candidateExtractionContracts.ts");
if (existsSync(backendExtractionContract)) {
  const backendContract = readFileSync(backendExtractionContract, "utf8");
  if (!backendContract.includes(`"${fixtures.extraction.contractVersion}"`)) {
    errors.push("mobile extraction fixture version does not match backend");
  }
  for (const field of fixtures.extraction.allowedFields) {
    if (!backendContract.includes(`"${field}"`)) errors.push(`backend extraction field drifted: ${field}`);
  }
}
const backendJourneyContract = resolve(root, "..", "backend", "src", "utils", "journeyAnalytics.ts");
if (existsSync(backendJourneyContract)) {
  const backendJourney = readFileSync(backendJourneyContract, "utf8");
  for (const eventName of fixtures.extraction.analyticsEvents) {
    if (!api.includes(`"${eventName}"`)) errors.push(`mobile extraction analytics event missing: ${eventName}`);
    if (!backendJourney.includes(`"${eventName}"`)) errors.push(`backend extraction analytics allowlist missing: ${eventName}`);
  }
}
for (const status of fixtures.extraction.draftStatuses) {
  if (!extractionTypes.includes(`"${status}"`)) errors.push(`missing extraction draft status: ${status}`);
}
const stateFragments = {
  processing: "processing your candidate-owned pdf",
  error: "could not create suggestions",
  expired: "draft expired or unavailable",
  "provider-unavailable": "extraction provider unavailable",
};
for (const state of fixtures.extraction.uiStates) {
  if (!extraction.toLowerCase().includes(stateFragments[state])) errors.push(`missing extraction UI state: ${state}`);
}
for (const required of [
  "sourceSnippet",
  "confidence",
  '"accepted"',
  '"rejected"',
  "deleteCandidateExtractionDraft",
]) {
  if (!extraction.includes(required)) errors.push(`missing governed extraction guardrail: ${required}`);
}
for (const required of ["every suggestion", "self-attested", "immigration eligibility"]) {
  if (!extraction.toLowerCase().includes(required)) errors.push(`missing governed extraction guardrail: ${required}`);
}
if (extraction.includes("OPENAI_API_KEY") || extraction.includes("CANDIDATE_EXTRACTION_API_KEY")) {
  errors.push("mobile extraction surface must not contain provider keys");
}
const suggestionIds = new Set(fixtures.extraction.suggestions.map((item) => item.id));
const acceptedIds = fixtures.extraction.reviewPayload.acceptedSuggestionIds;
const rejectedIds = fixtures.extraction.reviewPayload.rejectedSuggestionIds;
const decidedIds = [...acceptedIds, ...rejectedIds];
if (
  new Set(decidedIds).size !== suggestionIds.size ||
  decidedIds.some((id) => !suggestionIds.has(id)) ||
  acceptedIds.some((id) => rejectedIds.includes(id))
) {
  errors.push("extraction review fixture must decide every suggestion exactly once");
}

const relocationDetail = source("app/relocation-help/[id].tsx");
if (!relocationDetail.includes("fetchMyRelocationHelpRequest")) {
  errors.push("relocation detail must use the candidate-owned detail endpoint");
}
if (!api.includes("apiError.status !== 404")) {
  errors.push("relocation detail fallback must be limited to backwards-compatible 404 responses");
}

const routeManifest = JSON.parse(source("data/public-route-parity.json"));
const routeForPath = (path) => {
  const row = routeManifest.routes.find((candidate) => new RegExp(candidate.pattern, "i").test(path));
  if (!row) return null;
  const match = path.match(new RegExp(row.pattern, "i"));
  return {
    ...row,
    resolvedTarget: row.target?.replace(/\$(\d+)/g, (_, index) => encodeURIComponent(match?.[Number(index)] || "")),
  };
};
for (const [path, mode, target] of fixtures.deepLinks) {
  const row = routeForPath(path);
  if (!row || row.mode !== mode || row.target !== target) {
    errors.push(`unexpected Phase 7 deep-link mapping: ${path}`);
  }
}

for (const [input, expectedPath, expectedTarget] of fixtures.schemeAndHttpsDeepLinks) {
  const parsed = new URL(input);
  const path = parsed.protocol === "gsh-candidate:"
    ? parsed.hostname ? `/${parsed.hostname}${parsed.pathname}` : parsed.pathname || "/"
    : parsed.pathname;
  const normalizedPath = path.replace(/\/{2,}/g, "/");
  const row = routeForPath(normalizedPath);
  if (normalizedPath !== expectedPath || row?.resolvedTarget !== expectedTarget) {
    errors.push(`custom/HTTPS deep-link fixture failed: ${input}`);
  }
}

const matchId = (value) => typeof value === "string"
  ? value
  : value && typeof value === "object" ? String(value.id || value._id || "") : "";
for (const [shape, row] of Object.entries(fixtures.matchCompatibility)) {
  const id = matchId(row.id) || matchId(row._id);
  const job = row.job && typeof row.job === "object"
    ? row.job
    : row.jobId && typeof row.jobId === "object" ? row.jobId : null;
  const jobId = matchId(row.jobId) || matchId(job);
  if (!id || !jobId) errors.push(`${shape} match fixture did not normalize`);
}

for (const fixture of fixtures.benefitOfferRejections) {
  const expired = fixture.validUntil && Date.parse(fixture.validUntil) <= Date.parse("2026-09-01T00:00:00.000Z");
  const inactive = fixture.status !== "active";
  let unapprovedHost = false;
  if (fixture.destinationUrl) {
    const host = new URL(fixture.destinationUrl).hostname;
    unapprovedHost = !(fixture.allowedDestinationHosts || []).includes(host);
  }
  const rejected = expired || inactive || unapprovedHost;
  if (!rejected) errors.push(`benefit offer fail-closed fixture passed unexpectedly: ${fixture.case}`);
}
if (!source("app/relocation-perks.tsx").includes("candidateBenefitOffers(data)")) {
  errors.push("relocation perks screen must consume governed candidate offer projection");
}

if (errors.length) {
  console.error(`Phase 7 parity validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Phase 7 parity fixtures valid: extraction states/review, relocation detail, deep links, country normalization, and batch bounds.");
