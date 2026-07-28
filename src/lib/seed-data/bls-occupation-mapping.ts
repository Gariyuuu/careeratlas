// Curated mapping from CareerAtlas occupation slugs to real BLS Standard
// Occupational Classification (SOC) codes. Only high-confidence, unambiguous
// matches are included — most of CareerAtlas's 1,188 generated occupations
// (e.g. "Gaming Software Engineer") don't correspond to a distinct real SOC
// code and are intentionally left out rather than force a wrong mapping.
//
// BLS OEWS reports wages for the occupation as a whole (all experience
// levels combined) — it does not break wages out by seniority the way
// CareerAtlas's seed data does, so real data replaces every seniority
// level's percentile row for a matched occupation with the same
// national, all-experience-levels figures.
export interface BlsOccupationMapping {
  occupationSlug: string;
  socCode: string; // 6-digit SOC code, no dash (e.g. "151252" for 15-1252)
  socTitle: string; // official BLS occupation title, for auditability
}

export const BLS_OCCUPATION_MAPPING: BlsOccupationMapping[] = [
  { occupationSlug: "software-engineer", socCode: "151252", socTitle: "Software Developers" },
  { occupationSlug: "backend-engineer", socCode: "151252", socTitle: "Software Developers" },
  { occupationSlug: "mobile-engineer", socCode: "151252", socTitle: "Software Developers" },
  { occupationSlug: "frontend-engineer", socCode: "151254", socTitle: "Web Developers" },
  { occupationSlug: "qa-engineer", socCode: "151253", socTitle: "Software Quality Assurance Analysts and Testers" },
  { occupationSlug: "systems-administrator", socCode: "151244", socTitle: "Network and Computer Systems Administrators" },
  { occupationSlug: "technical-writer", socCode: "273042", socTitle: "Technical Writers" },
  { occupationSlug: "data-scientist", socCode: "152051", socTitle: "Data Scientists" },
  { occupationSlug: "statistician", socCode: "152041", socTitle: "Statisticians" },
  { occupationSlug: "actuary", socCode: "152011", socTitle: "Actuaries" },
  { occupationSlug: "security-analyst", socCode: "151212", socTitle: "Information Security Analysts" },
  { occupationSlug: "security-engineer", socCode: "151212", socTitle: "Information Security Analysts" },
  { occupationSlug: "penetration-tester", socCode: "151212", socTitle: "Information Security Analysts" },
  { occupationSlug: "registered-nurse", socCode: "291141", socTitle: "Registered Nurses" },
  { occupationSlug: "nurse-practitioner", socCode: "291171", socTitle: "Nurse Practitioners" },
  { occupationSlug: "physician-assistant", socCode: "291071", socTitle: "Physician Assistants" },
  { occupationSlug: "pharmacist", socCode: "291051", socTitle: "Pharmacists" },
  { occupationSlug: "physical-therapist", socCode: "291123", socTitle: "Physical Therapists" },
  { occupationSlug: "clinical-psychologist", socCode: "193033", socTitle: "Clinical, Counseling, and School Psychologists" },
  { occupationSlug: "medical-laboratory-scientist", socCode: "292011", socTitle: "Medical and Clinical Laboratory Technologists" },
  { occupationSlug: "medical-coder", socCode: "292072", socTitle: "Medical Records Specialists" },
  { occupationSlug: "healthcare-administrator", socCode: "119111", socTitle: "Medical and Health Services Managers" },
  { occupationSlug: "medical-practice-manager", socCode: "119111", socTitle: "Medical and Health Services Managers" },
  { occupationSlug: "financial-advisor", socCode: "132052", socTitle: "Personal Financial Advisors" },
  { occupationSlug: "wealth-manager", socCode: "132052", socTitle: "Personal Financial Advisors" },
  { occupationSlug: "equity-research-analyst", socCode: "132051", socTitle: "Financial and Investment Analysts" },
  { occupationSlug: "fp-a-analyst", socCode: "132031", socTitle: "Budget Analysts" },
  { occupationSlug: "business-analyst", socCode: "131111", socTitle: "Management Analysts" },
];
