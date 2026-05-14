import { getApiV1BaseUrl, getMobileRegistrationKey } from "./config";
export interface ApiError {
  message: string;
  status: number;
}

const DEFAULT_FETCH_TIMEOUT_MS = 45_000;

function isAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === "AbortError") return true;
  if (e instanceof Error && e.name === "AbortError") return true;
  return false;
}

let getToken: () => string | null = () => null;

/** Wire auth store once at startup so fetch helpers stay decoupled from Zustand internals. */
export function bindAuthTokenGetter(fn: () => string | null) {
  getToken = fn;
}

export async function apiFetchJson<T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean; timeoutMs?: number }
): Promise<T> {
  const auth = opts?.auth !== false;
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const token = auth ? getToken() : null;
  const url = `${getApiV1BaseUrl()}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const upstream = init?.signal;
  const onUpstreamAbort = () => {
    clearTimeout(timeoutId);
    controller.abort(upstream?.reason);
  };

  if (upstream) {
    if (upstream.aborted) {
      clearTimeout(timeoutId);
      throw upstream.reason ?? new Error("Request aborted");
    }
    upstream.addEventListener("abort", onUpstreamAbort, { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      signal: controller.signal,
    });
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    upstream?.removeEventListener("abort", onUpstreamAbort);
    if (isAbortError(e)) {
      const cancelled = upstream?.aborted === true;
      const err: ApiError = {
        message: cancelled ? "Request cancelled" : "Request timed out",
        status: 0,
      };
      throw err;
    }
    throw e;
  }

  clearTimeout(timeoutId);
  upstream?.removeEventListener("abort", onUpstreamAbort);

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errJson = JSON.parse(text) as { message?: string; error?: string };
      errorMessage = errJson.message || errJson.error || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    const err: ApiError = { message: errorMessage, status: response.status };
    throw err;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON from server");
  }
}

export async function loginRequest(email: string, password: string) {
  return apiFetchJson<import("@/types/models").AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    { auth: false }
  );
}

export async function registerCandidate(email: string, password: string) {
  const mobileKey = getMobileRegistrationKey();
  return apiFetchJson<{ message: string; userId: string; email: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password, userType: "candidate" }),
      headers: mobileKey ? { "X-GSH-Mobile-Key": mobileKey } : undefined,
    },
    { auth: false }
  );
}

export async function registerCandidatePushToken(expoPushToken: string, platform: "ios" | "android" | "web") {
  return apiFetchJson<{ ok: boolean }>("/candidate/push-token", {
    method: "POST",
    body: JSON.stringify({ expoPushToken, platform }),
  });
}

export async function verifyOtpRequest(userId: string, code: string) {
  return apiFetchJson<import("@/types/models").AuthResponse>(
    "/auth/verify-otp",
    {
      method: "POST",
      body: JSON.stringify({ userId, code }),
    },
    { auth: false }
  );
}

export async function fetchOwnProfile(): Promise<Record<string, unknown>> {
  try {
    return await apiFetchJson<Record<string, unknown>>("/profile/me");
  } catch (e: unknown) {
    const err = e as ApiError;
    /** New accounts may not have a Profile row yet — backend returns 404; allow creating one in-app. */
    if (err.status === 404) {
      return {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        location: "",
        linkedin_profile: "",
        profileCompletion: 0,
      };
    }
    throw e;
  }
}

export async function fetchPublicJobs(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") q.append(k, String(v));
  });
  const qs = q.toString();
  return apiFetchJson<import("@/types/models").GetJobsResponse>(
    `/jobs/public${qs ? `?${qs}` : ""}`,
    undefined,
    { auth: false }
  );
}

export async function fetchPublicExternalJobListings(opts?: {
  sourceType?: string;
  q?: string;
  page?: number;
  perPage?: number;
}) {
  const q = new URLSearchParams();
  const st = opts?.sourceType?.trim();
  if (st) q.set("sourceType", st);
  const search = opts?.q?.trim();
  if (search) q.set("q", search);
  if (opts?.page != null) q.set("page", String(opts.page));
  if (opts?.perPage != null) q.set("perPage", String(opts.perPage));
  const qs = q.toString();
  return apiFetchJson<import("@/types/models").ExternalJobListingsPublicResponse>(
    `/external-job-listings/public${qs ? `?${qs}` : ""}`,
    undefined,
    { auth: false }
  );
}

export async function fetchPublicExternalJobById(id: string) {
  return apiFetchJson<import("@/types/models").ExternalJobListingPublic>(
    `/external-job-listings/public/${encodeURIComponent(id)}`,
    undefined,
    { auth: false }
  );
}

export async function recordExternalApplyClick(listingId: string) {
  return apiFetchJson<{ applyUrl?: string }>(
    `/external-job-listings/public/${encodeURIComponent(listingId)}/apply-click`,
    { method: "POST" },
    { auth: false }
  );
}

export async function fetchJobById(id: string) {
  return apiFetchJson<import("@/types/models").Job>(`/jobs/${encodeURIComponent(id)}`);
}

export async function fetchSavedJobs() {
  return apiFetchJson<import("@/types/models").SavedJobPopulated[]>("/saved-jobs");
}

export async function saveJob(jobId: string) {
  return apiFetchJson("/saved-jobs", {
    method: "POST",
    body: JSON.stringify({ jobId }),
  });
}

export async function unsaveJob(savedJobOrJobId: string) {
  return apiFetchJson(`/saved-jobs/${encodeURIComponent(savedJobOrJobId)}`, {
    method: "DELETE",
  });
}

export async function applyToJob(jobId: string, coverLetter?: string, resume?: string) {
  return apiFetchJson("/applications", {
    method: "POST",
    body: JSON.stringify({
      jobId,
      coverLetter: coverLetter || undefined,
      resume: resume?.trim() || undefined,
    }),
  });
}

export async function fetchApplications() {
  return apiFetchJson<import("@/types/models").Application[]>("/applications");
}

export async function withdrawApplication(id: string) {
  return apiFetchJson<{ message?: string }>(`/applications/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function updateProfile(body: Record<string, unknown>) {
  return apiFetchJson("/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** Multipart upload — field name `file` per API. */
export async function uploadFileFromUri(localUri: string, filename: string, mimeType: string) {
  const token = getToken();
  if (!token) throw { message: "Not signed in", status: 401 } as ApiError;

  const url = `${getApiV1BaseUrl()}/uploads/file`;
  const form = new FormData();
  form.append(
    "file",
    { uri: localUri, name: filename, type: mimeType || "application/octet-stream" } as unknown as Blob
  );

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const text = await response.text();
  if (!response.ok) {
    let errorMessage = "Upload failed";
    try {
      const errJson = JSON.parse(text) as { message?: string };
      errorMessage = errJson.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw { message: errorMessage, status: response.status } as ApiError;
  }

  return JSON.parse(text) as import("@/types/models").UploadFileResponse;
}

// —— Messages ——

export async function fetchConversations() {
  return apiFetchJson<import("@/types/models").ConversationSummary[]>("/messages/conversations");
}

export async function fetchThreadMessages(conversationId: string) {
  return apiFetchJson<import("@/types/models").ThreadMessage[]>(
    `/messages/conversations/${encodeURIComponent(conversationId)}/messages`
  );
}

export async function sendThreadMessage(conversationId: string, body: string) {
  return apiFetchJson<import("@/types/models").ThreadMessage>(
    `/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    }
  );
}

// —— Candidate alerts ——

export async function fetchCandidateNotificationPrefs() {
  return apiFetchJson<import("@/types/models").CandidateNotificationPrefsDto>(
    "/candidate/notification-prefs"
  );
}

export async function patchCandidateNotificationPrefs(
  patch: Partial<import("@/types/models").CandidateNotificationPrefsDto>
) {
  return apiFetchJson<import("@/types/models").CandidateNotificationPrefsDto>(
    "/candidate/notification-prefs",
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    }
  );
}

export async function fetchJobMatches(opts?: { unread?: boolean; limit?: number }) {
  const q = new URLSearchParams();
  if (opts?.unread) q.set("unread", "1");
  if (opts?.limit != null) q.set("limit", String(opts.limit));
  const qs = q.toString();
  return apiFetchJson<import("@/types/models").JobMatchesResponse>(
    `/candidate/job-matches${qs ? `?${qs}` : ""}`
  );
}

export async function markJobMatchRead(matchId: string) {
  return apiFetchJson(`/candidate/job-matches/${encodeURIComponent(matchId)}/read`, {
    method: "PATCH",
    body: "{}",
  });
}

export async function markAllJobMatchesRead() {
  return apiFetchJson<{ message: string }>("/candidate/job-matches/mark-all-read", {
    method: "POST",
    body: "{}",
  });
}

export async function fetchJobSearchAlerts() {
  return apiFetchJson<import("@/types/models").JobSearchAlertDto[]>("/candidate/job-search-alerts");
}

export async function createJobSearchAlert(name: string, filters: Record<string, unknown>) {
  return apiFetchJson<import("@/types/models").JobSearchAlertDto>("/candidate/job-search-alerts", {
    method: "POST",
    body: JSON.stringify({ name, filters }),
  });
}

export async function patchJobSearchAlert(
  id: string,
  body: Partial<{ name: string; isActive: boolean; filters: Record<string, unknown> }>
) {
  return apiFetchJson<import("@/types/models").JobSearchAlertDto>(
    `/candidate/job-search-alerts/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export async function deleteJobSearchAlert(id: string) {
  return apiFetchJson<{ message: string }>(`/candidate/job-search-alerts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// —— Candidate dashboard ——

export async function fetchCandidateDashboard() {
  return apiFetchJson<import("@/types/models").CandidateDashboardResponse>("/analytics/candidate-dashboard");
}

// —— In-app notification feed (bell / inbox) ——

export async function fetchNotificationFeed(opts?: {
  unreadOnly?: boolean;
  limit?: number;
  before?: string | null;
}) {
  const q = new URLSearchParams();
  if (opts?.unreadOnly) q.set("unreadOnly", "true");
  if (opts?.limit != null) q.set("limit", String(opts.limit));
  if (opts?.before) q.set("before", opts.before);
  const qs = q.toString();
  return apiFetchJson<import("@/types/models").NotificationListResponse>(
    `/notifications${qs ? `?${qs}` : ""}`
  );
}

export async function fetchUnreadNotificationCount() {
  return apiFetchJson<{ unreadCount: number }>("/notifications/unread-count");
}

export async function markAppNotificationRead(id: string) {
  return apiFetchJson(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

export async function markAllAppNotificationsRead() {
  return apiFetchJson<{ modified: number }>("/notifications/mark-all-read", {
    method: "POST",
  });
}

export async function dismissAppNotification(id: string) {
  return apiFetchJson<{ message: string }>(`/notifications/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// —— Feedback ——

export async function submitFeedback(body: {
  title: string;
  description: string;
  type: string;
  priority?: string;
  tags?: string[];
}) {
  return apiFetchJson("/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// —— Auth extras ——

export async function requestForgotPassword(email: string) {
  return apiFetchJson<{ message: string }>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    { auth: false }
  );
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetchJson("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/** Self-service permanent deletion (password + reason required by API). */
export async function deleteCandidateAccount(password: string, reason: string) {
  return apiFetchJson<{ message: string }>("/auth/delete-account", {
    method: "POST",
    body: JSON.stringify({ password, reason }),
  });
}

// —— Partners directory ——

export async function fetchPartners(params?: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") q.append(k, String(v));
  });
  const qs = q.toString();
  return apiFetchJson<import("@/types/models").PartnersListResponse>(
    `/partners${qs ? `?${qs}` : ""}`
  );
}

// —— Partner offers (referral codes) ——

export async function fetchCandidateOffers(params?: { page?: number; perPage?: number; q?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.perPage) q.set("perPage", String(params.perPage));
  if (params?.q) q.set("q", params.q);
  const qs = q.toString();
  return apiFetchJson<import("@/types/models").ReferralCodesListResponse>(
    `/referral-codes${qs ? `?${qs}` : ""}`
  );
}

export async function trackReferralCodeCopy(id: string) {
  return apiFetchJson(`/referral-codes/${encodeURIComponent(id)}/copy`, {
    method: "POST",
    body: "{}",
  });
}

// —— ATS assistant ——

export async function atsParseProfile(cvText: string) {
  return apiFetchJson<{ profile: Record<string, unknown> }>("/candidate/ats/parse-profile", {
    method: "POST",
    body: JSON.stringify({ cvText }),
  });
}

export async function atsAnalyze(body: {
  profile: Record<string, unknown>;
  jobDescription: string;
  country: string;
  role: string;
}) {
  return apiFetchJson<{ analysis: Record<string, unknown> }>("/candidate/ats/analyze", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
