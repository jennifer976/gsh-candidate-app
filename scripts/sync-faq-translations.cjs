// Sync candidate app FAQ copy from the matching frontend release. No network or database access.
const fs = require("node:fs");
const path = require("node:path");
const frontend = path.resolve(process.argv[2] || "../frontend");
const catalog = {};
for (const locale of ["en", "fr", "de", "es", "pt", "it", "nl", "pl"]) {
  const messages = JSON.parse(fs.readFileSync(path.join(frontend, "messages", locale + ".json"), "utf8"));
  const general = messages.faqsPage.generalFaqs;
  const candidate = messages.roleLandingFaq.candidateFaqs;
  if (!Array.isArray(general) || !Array.isArray(candidate)) throw Error("Missing reviewed FAQ data: " + locale);
  catalog[locale] = {
    title: messages.roleLandingFaq.candidateTitle,
    eyebrow: messages.faqsPage.help,
    intro: messages.faqsPage.heroIntro,
    groups: [
      { id:"general", title:messages.faqsPage.categoryGeneral, items:general },
      { id:"candidate", title:messages.faqsPage.categoryCandidate, items:candidate },
    ],
  };
}
const output = JSON.stringify(catalog, null, 2) + "\n";
const destination = path.resolve(__dirname, "../lib/i18n/candidate-faqs.json");
if (process.argv.includes("--check")) {
  if (!fs.existsSync(destination) || fs.readFileSync(destination, "utf8") !== output) throw Error("Candidate app FAQs differ from the frontend release. Run the FAQ sync.");
} else {
  fs.mkdirSync(path.dirname(destination), {recursive:true});
  fs.writeFileSync(destination, output);
}
console.log("Candidate FAQs checked for eight languages.");
