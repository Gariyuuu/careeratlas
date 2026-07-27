export const DEGREE_LEVELS = [
  "no_college",
  "some_college",
  "associate",
  "bachelor",
  "master",
  "mba",
  "professional",
  "doctorate",
  "bootcamp",
  "certificate",
  "trade_school",
  "self_taught",
] as const;

export type DegreeLevel = (typeof DEGREE_LEVELS)[number];

export const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  no_college: "No College",
  some_college: "Some College",
  associate: "Associate Degree",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  mba: "MBA",
  professional: "Professional Degree",
  doctorate: "Doctorate",
  bootcamp: "Bootcamp",
  certificate: "Certificate",
  trade_school: "Trade School",
  self_taught: "Self-Taught",
};

export interface MajorSeed {
  slug: string;
  name: string;
  category: string;
}

const m = (name: string, category: string): MajorSeed => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  category,
});

export const MAJORS: MajorSeed[] = [
  m("Computer Science", "STEM"),
  m("Data Science", "STEM"),
  m("Statistics", "STEM"),
  m("Mathematics", "STEM"),
  m("Electrical Engineering", "STEM"),
  m("Mechanical Engineering", "STEM"),
  m("Civil Engineering", "STEM"),
  m("Chemical Engineering", "STEM"),
  m("Biomedical Engineering", "STEM"),
  m("Physics", "STEM"),
  m("Chemistry", "STEM"),
  m("Biology", "STEM"),
  m("Environmental Science", "STEM"),
  m("Information Systems", "STEM"),
  m("Finance", "Business"),
  m("Accounting", "Business"),
  m("Business Administration", "Business"),
  m("Marketing", "Business"),
  m("Economics", "Business"),
  m("Supply Chain Management", "Business"),
  m("Entrepreneurship", "Business"),
  m("Psychology", "Social Science"),
  m("Political Science", "Social Science"),
  m("Sociology", "Social Science"),
  m("International Relations", "Social Science"),
  m("Public Policy", "Social Science"),
  m("English", "Humanities"),
  m("History", "Humanities"),
  m("Philosophy", "Humanities"),
  m("Communications", "Humanities"),
  m("Graphic Design", "Humanities"),
  m("Nursing", "Health"),
  m("Public Health", "Health"),
  m("Kinesiology", "Health"),
  m("Criminal Justice", "Social Science"),
  m("Education", "Social Science"),
];

export interface InstitutionSeed {
  slug: string;
  name: string;
  countryCode: string;
  control: "public" | "private_nonprofit" | "private_forprofit";
  levelType: "two_year" | "four_year" | "bootcamp" | "trade_school";
  annualTuitionInState?: number;
  annualTuitionOutState?: number;
}

const inst = (
  name: string,
  countryCode: string,
  control: InstitutionSeed["control"],
  levelType: InstitutionSeed["levelType"],
  annualTuitionInState?: number,
  annualTuitionOutState?: number,
): InstitutionSeed => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  countryCode,
  control,
  levelType,
  annualTuitionInState,
  annualTuitionOutState,
});

// Real institution names with illustrative, order-of-magnitude tuition
// figures — clearly marked "estimated" in CollegeCost, not pulled from a
// live College Scorecard import in this seed.
export const INSTITUTIONS: InstitutionSeed[] = [
  inst("University of California, Berkeley", "US", "public", "four_year", 15000, 48000),
  inst("University of Michigan", "US", "public", "four_year", 17000, 55000),
  inst("University of Texas at Austin", "US", "public", "four_year", 11000, 41000),
  inst("Georgia Institute of Technology", "US", "public", "four_year", 12000, 33000),
  inst("University of Washington", "US", "public", "four_year", 12000, 40000),
  inst("Massachusetts Institute of Technology", "US", "private_nonprofit", "four_year", 58000, 58000),
  inst("Stanford University", "US", "private_nonprofit", "four_year", 61000, 61000),
  inst("Carnegie Mellon University", "US", "private_nonprofit", "four_year", 60000, 60000),
  inst("New York University", "US", "private_nonprofit", "four_year", 58000, 58000),
  inst("Arizona State University", "US", "public", "four_year", 12000, 30000),
  inst("Penn State University", "US", "public", "four_year", 19000, 38000),
  inst("Ohio State University", "US", "public", "four_year", 12000, 37000),
  inst("Florida International University", "US", "public", "four_year", 6500, 18000),
  inst("Santa Monica College", "US", "public", "two_year", 1400, 8000),
  inst("Austin Community College", "US", "public", "two_year", 3000, 8500),
  inst("Northern Virginia Community College", "US", "public", "two_year", 5000, 12000),
  inst("App Academy", "US", "private_forprofit", "bootcamp", 20000, 20000),
  inst("Flatiron School", "US", "private_forprofit", "bootcamp", 17000, 17000),
  inst("General Assembly", "US", "private_forprofit", "bootcamp", 15000, 15000),
  inst("Lincoln Technical Institute", "US", "private_forprofit", "trade_school", 18000, 18000),
  inst("University of Toronto", "CA", "public", "four_year", 7000, 45000),
  inst("Imperial College London", "GB", "public", "four_year", 12000, 40000),
  inst("University of Oxford", "GB", "public", "four_year", 12000, 38000),
  inst("Indian Institute of Technology Bombay", "IN", "public", "four_year", 3000, 3000),
];
