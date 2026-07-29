export interface AuthUser {
  id?: string;
  _id?: string;
  email?: string;
  userType?: string;
  first_name?: string;
  last_name?: string;
  profile?: unknown | null;
}

export function authUserId(user: AuthUser | null | undefined): string {
  if (!user) return "";
  return String(user.id ?? user._id ?? "").trim();
}

export function userId(u: AuthUser | null): string {
  if (!u) return "";
  return String(u.id ?? u._id ?? "").trim();
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  profileCompleted?: boolean;
  profile?: unknown;
  message?: string;
}

export interface EmployerProfile {
  _id?: string;
  companyName?: string;
  businessName?: string;
  contactCompany?: string;
  companyLogo?: string;
  companyWebsite?: string;
  employerHiringModel?: {
    offersSponsorship?: boolean;
    hiresRemoteGlobally?: boolean;
  };
  sponsorLicense?: {
    status?: string;
    number?: string;
    registrationCountry?: string;
  };
}

export interface Job {
  _id: string;
  title: string;
  status?: "active" | "closed" | "de-activate" | "draft" | "pending_employer_approval" | string;
  companyName?: string;
  companyLogo?: string;
  locationCountry?: string;
  locationCity?: string;
  location?: string;
  jobType?: string;
  summary?: string;
  description?: string;
  salaryCurrency?: string;
  salaryPeriod?: string;
  minSalary?: number;
  maxSalary?: number;
  featured?: boolean;
  applicantsCount?: number;
  postedBy?: EmployerProfile | null;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  experienceLevel?: string;
  workMode?: string;
  mobility?: string[];
  visaRoutes?: string[];
  visaRouteOther?: string;
  benefits?: string[];
}

export interface GetJobsResponse {
  data: Job[];
  total: number;
  page: number;
  perPage: number;
}

export interface SavedJobPopulated {
  _id: string;
  userId: string;
  jobId: Job;
  listingActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
  type?: string;
  firstName?: string;
  lastName?: string;
  profileCompletion?: number;
  currentJobTitle?: string;
  location?: string;
}

// —— Phase 2: applications, messages, alerts ——

export interface ApplicationJobRef {
  _id: string;
  title: string;
  status?: "active" | "closed" | "de-activate" | "draft" | "pending_employer_approval" | string;
  companyName?: string;
  location?: string;
  jobType?: string;
  minSalary?: number;
  maxSalary?: number;
  postedBy?: string;
}

export interface Application {
  _id: string;
  jobId: ApplicationJobRef;
  userId: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt?: string;
  interviewSchedule?: {
    scheduledAt?: string;
    timezone?: string;
    meetingLink?: string;
    notes?: string;
  };
}

export type ConversationSource = "application" | "talent_pool" | "candidate_search";

export interface ConversationSummary {
  _id: string;
  source: ConversationSource;
  applicationId: string | null;
  talentPoolId: string | null;
  jobId: string | null;
  jobTitle: string;
  companyName?: string;
  candidateName?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  counterpartyLabel: string;
}

export interface ThreadMessage {
  _id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  createdAt: string;
}

export interface CandidateNotificationPrefsDto {
  emailNotifications: boolean;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  /** Mobile Expo push; omitted on older API responses — treat as true. */
  pushNotifications?: boolean;
}

export interface JobSearchAlertDto {
  _id: string;
  userId: string;
  name?: string;
  filters: Record<string, unknown>;
  isActive: boolean;
  lastScanAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobMatchNotificationRow {
  _id: string;
  jobId: unknown;
  source: "saved_search" | "followed_employer";
  read: boolean;
  createdAt: string;
}

export interface JobMatchesResponse {
  data: JobMatchNotificationRow[];
  unreadCount: number;
}

export interface UploadFileResponse {
  message?: string;
  url: string;
}

export interface SponsorCompany {
  _id?: string;
  companyName: string;
  slug: string;
  country?: string;
  city?: string;
  industry?: string;
  website?: string;
  sponsorStatus?: string;
  visaRoute?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceDate?: string;
  aliases?: string[];
  claimedEmployerUserId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SponsorCompanyListResponse {
  data: SponsorCompany[];
  possibleMatches?: SponsorCompany[];
  total: number;
  page: number;
  perPage: number;
}

export interface SponsorCompanyDetailResponse {
  company: SponsorCompany;
  relatedCompanies?: SponsorCompany[];
}

// —— Dashboard & notifications (web parity) ——

export interface DashboardChartPoint {
  month: string;
  applications: number;
  interviews: number;
  responses: number;
}

export interface DashboardSavedJobRow {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  minSalary?: number;
  maxSalary?: number;
  type: string;
  createdAt: string;
}

export interface DashboardRecentApplication {
  jobTitle: string;
  companyName: string;
  status: string;
  appliedAt: string;
}

export interface DashboardJobListing {
  _id: string;
  title: string;
  companyName: string;
  companyLogo?: string | null;
  location: string;
  locationCity?: string;
  locationCountry?: string;
  type: string;
  minSalary?: number;
  maxSalary?: number;
  visaRoutes?: string[];
  visaRouteOther?: string;
  createdAt: string;
}

export interface DashboardCuratedListingRow {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  country?: string;
  summary?: string;
  mobilityTags?: string[];
  sponsorshipAvailable?: boolean;
  relocationAvailable?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  sourceType?: string;
  agencyName?: string;
  hubListingUrl?: string;
}

export interface CandidateDashboardResponse {
  profile: {
    completionPercentage: number;
    isComplete: boolean;
  };
  stats: {
    totalApplied: number;
    interviews: number;
    responses: number;
    /** Live curated/external roles matching the public hub visibility rules. */
    curatedRolesPublished?: number;
  };
  chartData: DashboardChartPoint[];
  savedJobs: DashboardSavedJobRow[];
  recentApplications: DashboardRecentApplication[];
  latestJobs: DashboardJobListing[];
  latestCuratedExternal?: DashboardCuratedListingRow[];
}

export interface AppNotificationDto {
  _id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  meta?: Record<string, unknown>;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  data: AppNotificationDto[];
  unreadCount: number;
  nextCursor: string | null;
}

export interface PartnerListItem {
  _id?: string;
  userId?: string;
  businessName: string;
  companyLogo?: string;
  profile_picture?: string;
  listingGallery?: string[];
  companyWebsite: string;
  companyDescription: string;
  category: string;
  tier: string;
  location?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  jobFunctions?: string[];
  expertiseIndustries?: string[];
  bio?: string;
  directoryCtaUrl?: string;
  directoryCtaLabel?: string;
}

export interface PartnersListResponse {
  data: PartnerListItem[];
  total: number;
  page: number;
  perPage: number;
}

export interface PartnerDetailResponse {
  data: PartnerListItem;
}

export type TrackedApplicationStage =
  | "interested"
  | "applied"
  | "screen"
  | "interview"
  | "offer"
  | "closed";

export interface CandidateTrackedApplication {
  _id: string;
  companyName: string;
  roleTitle: string;
  destination?: string;
  roleUrl?: string;
  stage: TrackedApplicationStage;
  sponsorshipSignal?: "yes" | "no" | "case-by-case" | "unclear";
  relocationSignal?: "yes" | "no" | "case-by-case" | "unclear";
  notes?: string;
  followUpAt?: string | null;
  updatedAt?: string;
}

export interface CandidateOfferItem {
  _id: string;
  title: string;
  description: string;
  referral_code: string;
  expiryDate?: string;
  businessName?: string;
  category?: string;
  targetAudience?: string;
  featured?: boolean;
  partner?: { businessName?: string; category?: string; companyLogo?: string };
}

export interface ReferralCodesListResponse {
  data: CandidateOfferItem[];
  total: number;
  page: number;
  perPage: number;
}

export interface RelocationPerkItem {
  _id: string;
  title: string;
  description: string;
  logoUrl?: string;
  affiliateUrl?: string;
  promoCode?: string;
  category?: string;
  audience?: string;
  sortOrder?: number;
  status?: string;
}

export interface RelocationPerksDashboardResponse {
  audience: "candidate" | "employer";
  comingSoon: boolean;
  title: string;
  subtitle: string;
  perks: RelocationPerkItem[];
}

/** Curated / external listings (`GET /external-job-listings/public`). */
export interface ExternalJobListingPublic {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  applyUrl?: string;
  summary?: string;
  country?: string;
  mobilityTags?: string[];
  sponsorshipAvailable?: boolean;
  relocationAvailable?: boolean;
  sourceType?: string;
  agencyName?: string;
  agencyWebsite?: string;
  expiresAt?: string;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  externalPostedAt?: string;
  hubListingUrl?: string;
}

export interface ExternalJobListingsPublicResponse {
  hubCuratedBrowseUrl: string;
  data: ExternalJobListingPublic[];
  total: number;
  page: number;
  perPage: number;
}
