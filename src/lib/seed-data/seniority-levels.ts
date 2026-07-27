export interface SeniorityLevelSeed {
  slug: string;
  name: string;
  rank: number;
  description: string;
}

// Rank drives ordering and salary-projection math (progression logic).
export const SENIORITY_LEVELS: SeniorityLevelSeed[] = [
  { slug: "intern", name: "Intern", rank: 0, description: "Temporary student or early-career trainee position, usually 8-16 weeks." },
  { slug: "entry-level", name: "Entry Level", rank: 1, description: "First professional role, typically 0-1 years of experience." },
  { slug: "junior", name: "Junior", rank: 2, description: "1-2 years of experience, works under close guidance." },
  { slug: "mid-level", name: "Mid-Level", rank: 3, description: "2-5 years of experience, works independently on most tasks." },
  { slug: "senior", name: "Senior", rank: 4, description: "5-8 years of experience, mentors others and owns complex work." },
  { slug: "staff", name: "Staff", rank: 5, description: "8-12 years of experience, sets technical or functional direction across teams." },
  { slug: "principal", name: "Principal", rank: 6, description: "12+ years of experience, shapes strategy at the organizational level." },
  { slug: "manager", name: "Manager", rank: 7, description: "Manages a team of individual contributors." },
  { slug: "senior-manager", name: "Senior Manager", rank: 8, description: "Manages managers or a larger, more complex team." },
  { slug: "director", name: "Director", rank: 9, description: "Owns a function or business unit." },
  { slug: "vice-president", name: "Vice President", rank: 10, description: "Owns multiple functions, reports to executive leadership." },
  { slug: "senior-vice-president", name: "Senior Vice President", rank: 11, description: "Senior executive overseeing major divisions." },
  { slug: "c-suite", name: "C-Suite", rank: 12, description: "Chief-level executive (CEO, CTO, CFO, etc.)." },
  { slug: "partner", name: "Partner", rank: 13, description: "Equity partner or owner, common in consulting, law, and finance." },
];

export const SENIORITY_RANK_BY_SLUG: Record<string, number> = Object.fromEntries(
  SENIORITY_LEVELS.map((l) => [l.slug, l.rank]),
);
