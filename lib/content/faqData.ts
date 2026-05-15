export type FaqItem = { category: string; question: string; answer: string };

/** Derived from global_sponsor_hub-fe/src/app/(web)/faqs/data.tsx — answers flattened for React Native. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "General",
    question: "What is Global Sponsor Hub?",
    answer:
      "Global Sponsor Hub is built for international and sponsorship-friendly hiring. The main job board is for employer-posted roles (companies listing their own jobs). Recruitment agencies and partner-curated wider-web links appear on curated listings — separate from that board. Listings show visa sponsorship, relocation support, or openness to global talent where provided.",
  },
  {
    category: "General",
    question: "Do you hire or connect people directly?",
    answer:
      "We do not recruit or headhunt. Employers post and manage roles; candidates apply and communicate with employers via the platform.",
  },
  {
    category: "General",
    question: "Is the platform international?",
    answer: "Yes — employers, candidates, and partners can join from anywhere.",
  },
  {
    category: "General",
    question: "Do you vet jobs or partners?",
    answer:
      "Employer listings on the main board are reviewed for posting standards; we do not verify every claim. Agency and curated listings are maintained separately. Partner profiles are owned by partners.",
  },
  {
    category: "General",
    question: "What is the tree planting initiative?",
    answer:
      "We plant trees via Treeapp for every five candidates who join; employers can contribute additional trees through hiring programmes.",
  },
  {
    category: "General",
    question: "Do you have a mobile app?",
    answer:
      "Yes — this app gives you jobs, messaging, guides, and tools in one place, including long-form guides inside the Guides hub.",
  },
  {
    category: "General",
    question: "How do I contact support?",
    answer:
      "Use Feedback & support in this app, or email support@globalsponsorhub.com with your account email and a short description.",
  },

  {
    category: "For Candidates",
    question: "Do I have to pay to use the platform?",
    answer: "No — candidate accounts are free.",
  },
  {
    category: "For Candidates",
    question: "What kind of jobs will I find here?",
    answer:
      "Roles labelled for visa sponsorship, relocation support, global talent welcome, or similar mobility signals — always read each listing carefully.",
  },
  {
    category: "For Candidates",
    question: "How does the CV search work?",
    answer:
      "If you opt in, subscribed employers can discover your CV. Otherwise employers generally see you only when you apply.",
  },
  {
    category: "For Candidates",
    question: "What happens if an employer contacts me without my CV being visible?",
    answer:
      "Employers may contact you if you applied to their job, or if you opted into CV visibility and they found you there.",
  },
  {
    category: "For Candidates",
    question: "Can I contact partners directly?",
    answer: "Yes — partner directory listings include ways to reach providers.",
  },
  {
    category: "For Candidates",
    question: "How do I edit my profile or CV?",
    answer: "Open Profile from the bottom tabs, update your details and CV file, then save.",
  },
  {
    category: "For Candidates",
    question: "Tip for candidates:",
    answer:
      "Filter by the mobility labels you truly need before applying — sponsorship, relocation, and global hiring mean different things.",
  },

  {
    category: "For Employers",
    question: "How can Global Sponsor Hub help my hiring process?",
    answer:
      "Post international roles with clear mobility labels and reach mobile candidates directly on-platform.",
  },
  {
    category: "For Employers",
    question: "Can I search for candidates?",
    answer: "Yes with an active employer subscription and CV search entitlement.",
  },
  {
    category: "For Employers",
    question: "Do I need to offer sponsorship or relocation to post a job?",
    answer: "No — but listings must be honestly labelled.",
  },
  {
    category: "For Employers",
    question: "Do you manage applications for us?",
    answer: "No — you manage your pipeline.",
  },
  {
    category: "For Employers",
    question: "How much does it cost to post jobs?",
    answer:
      "Employer plans are tiered on the platform. Compare limits and features in the employer dashboard when signed in on web — candidate access remains free.",
  },
  {
    category: "For Employers",
    question: "Can I update or remove a job listing?",
    answer: "Yes — from your employer dashboard on the web.",
  },

  {
    category: "For Partners",
    question: "Who can be a partner on Global Sponsor Hub?",
    answer:
      "Businesses offering relocation or mobility-adjacent services such as immigration counsel, legal support, moving logistics, housing help, or cultural training.",
  },
  {
    category: "For Partners",
    question: "How do I list my business?",
    answer: "Complete a partner profile via the web onboarding journey.",
  },
  {
    category: "For Partners",
    question: "Do you pass on leads to partners?",
    answer: "No — enquiries go directly between users and partners.",
  },
  {
    category: "For Partners",
    question: "Tip for partners:",
    answer:
      "Specify countries covered, visa routes, languages, and evidence of regulated credentials to attract serious enquiries.",
  },
];
