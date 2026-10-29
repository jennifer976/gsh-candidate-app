import {
  CANDIDATE_AVAILABILITY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  type EmploymentOption,
} from "@/types/mobility";
import { JOB_PREFERENCE_OPTIONS } from "@/lib/job-preferences";
import type { SitePhotoKey } from "@/lib/sitePhotos";

/** Existing stored sponsorship values from app/mobility-profile.tsx. */
export const SPONSORSHIP_OPTIONS = [
  "Requires sponsorship",
  "No sponsorship required",
  "Already sponsored",
  "Open to relocation support",
] as const;

export const RELOCATION_OPTIONS = [
  "Ready to relocate",
  "Can relocate with employer support",
  "Remote-first only",
  "Exploring options",
  "Not willing to relocate",
] as const;

export const VISA_STATUS_OPTIONS = [
  "Citizen",
  "Permanent Resident",
  "Work Permit Required",
  "Student Visa",
  "Work Visa",
  "Other",
] as const;

export const NOTICE_OPTIONS = [
  "Immediately available",
  "1-2 weeks",
  "1 month",
  "2 months",
  "3 months",
  "More than 3 months",
] as const;

export const SEARCH_INTENT_OPTIONS = [
  "Actively applying now",
  "Open to the right role",
  "Exploring relocation options",
  "Not actively looking",
] as const;

export const REMOTE_OPTIONS = [
  "Remote",
  "Hybrid",
  "On-site",
  "Remote or Hybrid",
] as const;

export const EMPLOYMENT_LABELS: Record<EmploymentOption, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote_domestic: "Remote in the employing country",
  remote_cross_border: "Cross-border remote",
  relocation: "Relocation",
  employer_of_record: "Employer of record",
  local_entity: "Local entity employment",
};

export const SALARY_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "INR",
  "NGN",
  "AED",
] as const;

export const WORK_AUTH_STATUS = [
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Expired", value: "expired" },
  { label: "Not sure", value: "unknown" },
] as const;

export const REGISTRATION_STATUS = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Expired", value: "expired" },
  { label: "Not held", value: "not_held" },
  { label: "Not sure", value: "unknown" },
] as const;

export const COMPANY_PLACEHOLDER = "Not specified";

export type OnboardingStepMeta = {
  step: number;
  group: string;
  photo: SitePhotoKey;
  optional: boolean;
  heading: string;
  sub: string;
};

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  {
    step: 1,
    group: "About you",
    photo: "about-city",
    optional: true,
    heading: "What should we call you?",
    sub: "Your name shows on your profile when you choose to be found.",
  },
  {
    step: 2,
    group: "About you",
    photo: "dublin",
    optional: false,
    heading: "Where do you live now?",
    sub: "This helps match you with the right jobs.",
  },
  {
    step: 3,
    group: "Your move",
    photo: "specialists",
    optional: false,
    heading: "Do you need visa sponsorship?",
    sub: "Choose the one that fits you best.",
  },
  {
    step: 4,
    group: "Your move",
    photo: "plan-hero",
    optional: false,
    heading: "Where do you want to work?",
    sub: "Add the countries you would move to, or choose remote-first.",
  },
  {
    step: 5,
    group: "Your move",
    photo: "plan-perks",
    optional: true,
    heading: "Your right to work",
    sub: "Add permission you already hold or have applied for. Leave this empty if you have none.",
  },
  {
    step: 6,
    group: "Your work",
    photo: "talent-pool",
    optional: false,
    heading: "What work do you want?",
    sub: "Add the roles you want and your experience.",
  },
  {
    step: 7,
    group: "Your work",
    photo: "employers",
    optional: true,
    heading: "Your industry and skills",
    sub: "Choose one main industry and add the skills you use most.",
  },
  {
    step: 8,
    group: "Your work",
    photo: "employers",
    optional: false,
    heading: "How do you want to work?",
    sub: "Select every setup you would accept.",
  },
  {
    step: 9,
    group: "Your work",
    photo: "arrival",
    optional: false,
    heading: "When could you start?",
    sub: "Employers use this to plan interviews.",
  },
  {
    step: 10,
    group: "Your work",
    photo: "money",
    optional: false,
    heading: "What salary are you looking for?",
    sub: "Add a range so jobs can be compared for you.",
  },
  {
    step: 11,
    group: "Your profile",
    photo: "talent-pool",
    optional: true,
    heading: "Add your CV",
    sub: "Upload your CV and add a short summary. You can do this later.",
  },
  {
    step: 12,
    group: "Your profile",
    photo: "specialists",
    optional: true,
    heading: "A little more about you",
    sub: "All optional. These help employers who can find you.",
  },
  {
    step: 13,
    group: "Your privacy",
    photo: "about-city",
    optional: true,
    heading: "Who can find and contact you?",
    sub: "Choose employers, agencies, both or neither. Discovery stays off until you turn it on.",
  },
];

export {
  CANDIDATE_AVAILABILITY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  JOB_PREFERENCE_OPTIONS,
};
