/** Must match `JOB_PREFERENCES` in backend `models/profiles.ts`. */

export const JOB_PREFERENCE_OPTIONS = ["Full Time", "Part Time", "Contract", "Freelance"] as const;

export type JobPreferenceOption = (typeof JOB_PREFERENCE_OPTIONS)[number];
