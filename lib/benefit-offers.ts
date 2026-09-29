import type {
  BenefitOfferView,
  RelocationPerkItem,
  RelocationPerksDashboardResponse,
} from "@/types/models";

const CLICK_EVENT = "benefit_offer_clicked";
const REDEMPTION_EVENT = "benefit_offer_redeemed";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const validDate = (value: unknown) => {
  const parsed = Date.parse(clean(value));
  return Number.isFinite(parsed) ? parsed : null;
};

function audienceAllowsCandidate(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (Array.isArray(value)) return value.includes("candidate") || value.includes("all");
  return ["candidate", "both", "all"].includes(clean(value));
}

function hasPartnerContract(item: RelocationPerkItem): boolean {
  return Boolean(
    clean(item.benefitPartnerId) ||
      clean(item.agreementId) ||
      item.benefitPartner ||
      item.agreement,
  );
}

function allowedHttpsUrl(url: string, hosts: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      (parsed.port && parsed.port !== "443")
    ) {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
    return hosts.some((host) => host.toLowerCase().replace(/\.$/, "") === hostname);
  } catch {
    return false;
  }
}

function safeHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password && (!parsed.port || parsed.port === "443");
  } catch {
    return false;
  }
}

export type BenefitOfferRejection =
  | "missing_contract"
  | "not_eligible"
  | "inactive_partner"
  | "inactive_agreement"
  | "agreement_mismatch"
  | "outside_validity"
  | "offer_inactive"
  | "audience_not_allowed"
  | "missing_disclosure"
  | "destination_not_allowed"
  | "redemption_invalid"
  | "analytics_invalid";

export function validateCandidateBenefitOffer(
  item: RelocationPerkItem,
  now = new Date(),
): BenefitOfferRejection[] {
  const issues: BenefitOfferRejection[] = [];
  const id = clean(item.id) || clean(item._id);
  const partnerId = clean(item.benefitPartnerId);
  const agreementId = clean(item.agreementId);
  const validFrom = validDate(item.validFrom);
  const validUntil = item.validUntil == null || item.validUntil === "" ? null : validDate(item.validUntil);
  const agreementFrom = validDate(item.agreement?.validFrom);
  const agreementUntil =
    item.agreement?.validUntil == null || item.agreement.validUntil === ""
      ? null
      : validDate(item.agreement.validUntil);
  const nowMs = now.getTime();

  if (!id || !partnerId || !agreementId || validFrom == null || !item.agreement || !item.benefitPartner) {
    issues.push("missing_contract");
  }
  if (
    item.eligibility &&
    (item.eligibility.eligible !== true ||
      item.eligibility.source !== "server" ||
      ["invalid", "expired", "withdrawn", "ineligible"].includes(clean(item.eligibility.status).toLowerCase()))
  ) {
    issues.push("not_eligible");
  }
  if (item.benefitPartner?.status !== "active") issues.push("inactive_partner");
  if (item.agreement?.status !== "active" || !clean(item.agreement?.acceptedAt)) issues.push("inactive_agreement");
  if (
    item.benefitPartner?.id !== partnerId ||
    item.agreement?.id !== agreementId ||
    item.agreement?.benefitPartnerId !== partnerId
  ) {
    issues.push("agreement_mismatch");
  }
  if (
    validFrom == null ||
    validFrom > nowMs ||
    (item.validUntil != null && (validUntil == null || nowMs >= validUntil)) ||
    agreementFrom == null ||
    agreementFrom > nowMs ||
    (item.agreement?.validUntil != null && (agreementUntil == null || nowMs >= agreementUntil))
  ) {
    issues.push("outside_validity");
  }
  if (item.status !== "active") issues.push("offer_inactive");
  if (!audienceAllowsCandidate(item.audience)) issues.push("audience_not_allowed");
  if (!clean(item.disclosure) || !clean(item.agreement?.disclosureText)) issues.push("missing_disclosure");

  const offerHosts = (item.allowedDestinationHosts ?? []).map(clean).filter(Boolean);
  const partnerHosts = (item.benefitPartner?.approvedDestinationHosts ?? []).map(clean).filter(Boolean);
  const sharedHosts = offerHosts.filter((host) =>
    partnerHosts.some((approved) => approved.toLowerCase() === host.toLowerCase()),
  );
  const destination = clean(item.destinationUrl) || clean(item.affiliateUrl);
  const redemptionKind = clean(item.redemptionKind) || (destination ? "external_offer" : "");
  const redemptionCode = clean(item.redemptionCode) || clean(item.promoCode);
  if (redemptionKind === "external_offer") {
    if (!destination || !allowedHttpsUrl(destination, sharedHosts)) issues.push("destination_not_allowed");
  } else if (redemptionKind === "code") {
    if (!redemptionCode) issues.push("redemption_invalid");
  } else {
    issues.push("redemption_invalid");
  }
  if (
    item.analytics?.clickEvent !== CLICK_EVENT ||
    item.analytics?.redemptionEvent !== REDEMPTION_EVENT
  ) {
    issues.push("analytics_invalid");
  }
  return [...new Set(issues)];
}

function legacyCandidateOffer(item: RelocationPerkItem): BenefitOfferView | null {
  if (hasPartnerContract(item)) return null;
  if (item.status && item.status !== "active") return null;
  if (!clean(item.title) || !clean(item.description)) return null;
  if (!audienceAllowsCandidate(item.audience)) return null;
  const destinationUrl = clean(item.destinationUrl) || clean(item.affiliateUrl);
  if (!safeHttpsUrl(destinationUrl)) return null;
  const highlight = clean(item.offerHighlight);
  return {
    id: clean(item.id) || clean(item._id),
    placementId: clean(item.placementId) || null,
    title: item.title,
    description: item.description,
    category: item.category,
    logoUrl: item.logoUrl,
    disclosure: clean(item.disclosure),
    termsUrl: null,
    validUntil: item.validUntil ?? null,
    redemptionKind: "external_offer",
    destinationUrl,
    redemptionCode: clean(item.redemptionCode) || clean(item.promoCode) || null,
    highlight: highlight || null,
  };
}

export function candidateBenefitOffers(
  response?: RelocationPerksDashboardResponse,
  now = new Date(),
): BenefitOfferView[] {
  const rows = response?.perks ?? response?.data ?? [];
  return rows.flatMap((item) => {
    if (validateCandidateBenefitOffer(item, now).length > 0) {
      const legacy = legacyCandidateOffer(item);
      return legacy ? [legacy] : [];
    }
    const destinationUrl = clean(item.destinationUrl) || clean(item.affiliateUrl);
    const redemptionCode = clean(item.redemptionCode) || clean(item.promoCode);
    const termsUrl = clean(item.termsUrl);
    return [{
      id: clean(item.id) || clean(item._id),
      placementId: clean(item.placementId) || null,
      title: item.title,
      description: item.description,
      category: item.category,
      logoUrl: item.logoUrl,
      disclosure: clean(item.disclosure),
      termsUrl: termsUrl && safeHttpsUrl(termsUrl) ? termsUrl : null,
      validUntil: item.validUntil ?? null,
      redemptionKind: (clean(item.redemptionKind) || (destinationUrl ? "external_offer" : "code")) as "external_offer" | "code",
      destinationUrl: destinationUrl || null,
      redemptionCode: redemptionCode || null,
      highlight: null,
    }];
  });
}
