export type FaqItem = { category: string; question: string; answer: string };

/** Keep in sync with global_sponsor_hub-fe/src/app/(web)/faqs/data.tsx (plain-text answers for RN). */
export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "General",
    question: "What is Global Sponsor Hub?",
    answer:
      "A hiring and mobility platform for international roles: direct employer jobs on-site, curated external roles with clear labels, a mobility partner directory, and guides & tools. Candidates apply to employer jobs here; external listings open on partner sites.",
  },
  {
    category: "General",
    question: "Do you hire or connect people directly?",
    answer:
      "We do not recruit or headhunt. Employers post and manage their own roles. Candidates apply and communicate directly with employers through the platform.",
  },
  {
    category: "General",
    question: "Is the platform international?",
    answer: "Yes. We operate globally and welcome employers, candidates, and partners from anywhere in the world.",
  },
  {
    category: "General",
    question: "Do you vet jobs or partners?",
    answer:
      "Employer-posted jobs are reviewed for labelling and posting standards. We do not independently verify every employer claim. Curated external roles are maintained manually. Partner directory profiles are owned by partners.",
  },
  {
    category: "General",
    question: "What is the tree planting initiative?",
    answer:
      "We plant one tree for every five candidates who join (via Treeapp). Employers who hire through GSH contribute additional trees — see the About page for live impact stats.",
  },
  {
    category: "General",
    question: "Do you have a mobile app?",
    answer:
      "Yes — this candidate app (iOS and Android) uses the same login as the website. Employer and partner accounts use the full web dashboard.",
  },
  {
    category: "General",
    question: "How do I permanently delete my account?",
    answer:
      "Candidates: Settings → Danger zone in this app or on the web (password + reason required). Employers and partners: Settings → Danger zone on the website. If you cannot sign in, email support@globalsponsorhub.com from your registered address.",
  },
  {
    category: "General",
    question: "How do I contact support?",
    answer:
      "Use Feedback & support in this app, the Contact page on the website, or email support@globalsponsorhub.com with your account email and a short description.",
  },
  {
    category: "For Candidates",
    question: "Do I have to pay to use the platform?",
    answer: "No. Candidate access is completely free.",
  },
  {
    category: "For Candidates",
    question: "What kind of jobs will I find here?",
    answer:
      "Roles labelled for visa sponsorship, relocation support, global talent welcome, or similar mobility signals — always read each listing carefully before applying.",
  },
  {
    category: "For Candidates",
    question: "How does the CV search work?",
    answer:
      "If you opt in on your profile, subscribed employers can discover your CV. Otherwise employers generally see you when you apply to their roles.",
  },
  {
    category: "For Candidates",
    question: "What happens if an employer contacts me without my CV being visible?",
    answer:
      "Employers may contact you if you applied to their job, or if you opted into CV visibility and they found you in search.",
  },
  {
    category: "For Candidates",
    question: "Can I contact partners directly?",
    answer: "Yes — partner directory listings include contact details and links.",
  },
  {
    category: "For Candidates",
    question: "How do I edit my profile or CV?",
    answer: "Open Profile from the bottom tabs, update your details and CV file, then save.",
  },
  {
    category: "For Candidates",
    question: "How do I delete my candidate account?",
    answer:
      "Settings → Danger zone in this app or on the web. Enter your password, a reason, and confirm the action is permanent.",
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
      "Tiered employer plans on the website — compare features on the employer pricing page when signed in.",
  },
  {
    category: "For Employers",
    question: "Can I update or remove a job listing?",
    answer: "Yes — from your employer dashboard on the web (My Jobs).",
  },
  {
    category: "For Employers",
    question: "How do I delete my employer account and job listings?",
    answer:
      "Sign in on the website → Settings → Danger zone. Active jobs are removed as part of permanent deletion; limited operational retention may apply per the Privacy Policy.",
  },
  {
    category: "For Partners",
    question: "Who can be a partner on Global Sponsor Hub?",
    answer:
      "Businesses offering relocation or mobility services: immigration advice, legal support, moving, housing, cultural training, and similar.",
  },
  {
    category: "For Partners",
    question: "How do I list my business?",
    answer: "Sign up as a partner on the web, complete your profile, and publish in the partner directory.",
  },
  {
    category: "For Partners",
    question: "Do you pass on leads to partners?",
    answer: "No — contact happens directly between users and partners.",
  },
  {
    category: "For Partners",
    question: "How do I delete my partner directory account?",
    answer:
      "Sign in on the website → Settings → Danger zone, or email support@globalsponsorhub.com from your registered address.",
  },
  {
    category: "For Partners",
    question: "Tip for partners:",
    answer:
      "Specify countries covered, visa routes, languages, and credentials to attract serious enquiries.",
  },
];
