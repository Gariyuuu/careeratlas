export type SeniorityTrack = "ic" | "management" | "executive" | "full";

export interface OccupationSeed {
  title: string;
  summary: string;
  /** Skill *names* (must match an entry in skills.ts) — resolved to slugs at seed time. */
  skills: string[];
  aliases?: { alias: string; kind: "abbreviation" | "synonym" | "misspelling" | "related" }[];
  /** Determines which SeniorityLevel rows get attached to this occupation. */
  seniorityTrack: SeniorityTrack;
  automationExposure: number; // 0-1, higher = more exposed
  remoteFriendliness: number; // 0-1, higher = more remote-friendly
}

export interface JobFamilySeed {
  name: string;
  description: string;
  occupations: OccupationSeed[];
}

export interface SubindustrySeed {
  name: string;
  description: string;
  jobFamilies: JobFamilySeed[];
}

export interface IndustryTaxonomySeed {
  industrySlug: string;
  subindustries: SubindustrySeed[];
}

// Which seniority-level slugs attach to an occupation, by track.
export const SENIORITY_TRACK_LEVELS: Record<SeniorityTrack, string[]> = {
  ic: ["intern", "entry-level", "junior", "mid-level", "senior", "staff", "principal"],
  management: ["entry-level", "mid-level", "manager", "senior-manager", "director", "vice-president"],
  executive: ["director", "vice-president", "senior-vice-president", "c-suite", "partner"],
  full: [
    "intern",
    "entry-level",
    "junior",
    "mid-level",
    "senior",
    "manager",
    "director",
    "vice-president",
    "c-suite",
  ],
};
