export const RELOCATION_SERVICE_OPTIONS = [
  [
    "immigration_information",
    "Visa & immigration"
  ],
  [
    "relocation_planning",
    "Relocation planning"
  ],
  [
    "tax",
    "Tax"
  ],
  [
    "housing",
    "Housing"
  ],
  [
    "employment_support",
    "Employment support"
  ],
  [
    "settlement",
    "Settling in"
  ],
  [
    "banking_finance",
    "Banking & personal finance"
  ],
  [
    "healthcare_insurance",
    "Healthcare & insurance"
  ],
  [
    "education_childcare",
    "Schools & childcare"
  ],
  [
    "language_training",
    "Language support"
  ],
  [
    "moving_shipping",
    "Removals & shipping"
  ],
  [
    "pet_relocation",
    "Moving with pets"
  ],
  [
    "business_setup",
    "Business setup"
  ],
  [
    "family_support",
    "Family support"
  ]
] as const;
export const RELOCATION_NEEDS = RELOCATION_SERVICE_OPTIONS.map(([id]) => id);
export const RELOCATION_SERVICE_LABELS: Record<string,string> = Object.fromEntries(RELOCATION_SERVICE_OPTIONS);
