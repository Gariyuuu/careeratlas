export interface DataSourceSeed {
  slug: string;
  name: string;
  organization: string;
  url?: string;
  requiresApiKey: boolean;
  apiKeyEnvVar?: string;
  description: string;
}

export const DATA_SOURCES: DataSourceSeed[] = [
  {
    slug: "bls-oews",
    name: "Occupational Employment and Wage Statistics",
    organization: "U.S. Bureau of Labor Statistics",
    url: "https://www.bls.gov/oes/",
    requiresApiKey: false,
    apiKeyEnvVar: "BLS_API_KEY",
    description: "Official U.S. wage and employment estimates by occupation and area. A free API key raises the daily request quota but is not required.",
  },
  {
    slug: "bls-ep",
    name: "Employment Projections",
    organization: "U.S. Bureau of Labor Statistics",
    url: "https://www.bls.gov/emp/",
    requiresApiKey: false,
    apiKeyEnvVar: "BLS_API_KEY",
    description: "10-year U.S. occupational employment growth projections.",
  },
  {
    slug: "onet",
    name: "O*NET Database",
    organization: "U.S. Department of Labor",
    url: "https://www.onetonline.org/",
    requiresApiKey: false,
    description: "Standardized occupational descriptions, skills, and task data.",
  },
  {
    slug: "census-acs",
    name: "American Community Survey",
    organization: "U.S. Census Bureau",
    url: "https://www.census.gov/programs-surveys/acs",
    requiresApiKey: true,
    apiKeyEnvVar: "CENSUS_API_KEY",
    description: "Demographic, income, and education survey data.",
  },
  {
    slug: "college-scorecard",
    name: "College Scorecard",
    organization: "U.S. Department of Education",
    url: "https://collegescorecard.ed.gov/data/",
    requiresApiKey: true,
    apiKeyEnvVar: "COLLEGE_SCORECARD_API_KEY",
    description: "Institution-level cost, debt, and earnings outcomes.",
  },
  {
    slug: "world-bank",
    name: "World Bank Open Data",
    organization: "The World Bank",
    url: "https://data.worldbank.org/",
    requiresApiKey: false,
    description: "International labor-market and economic indicators.",
  },
  {
    slug: "oecd",
    name: "OECD Statistics",
    organization: "OECD",
    url: "https://data.oecd.org/",
    requiresApiKey: false,
    description: "Cross-country labor market and education statistics.",
  },
  {
    slug: "ilo",
    name: "ILOSTAT",
    organization: "International Labour Organization",
    url: "https://ilostat.ilo.org/",
    requiresApiKey: false,
    description: "Global labor statistics covering employment and wages.",
  },
  {
    slug: "eurostat",
    name: "Eurostat",
    organization: "European Commission",
    url: "https://ec.europa.eu/eurostat",
    requiresApiKey: false,
    description: "European Union labor market and earnings statistics.",
  },
  {
    slug: "careeratlas-seed",
    name: "CareerAtlas Seed Estimates",
    organization: "CareerAtlas",
    requiresApiKey: false,
    description: "Deterministically generated placeholder figures used to make the product usable before every official connector is fully populated. Never treat these as verified real-world data.",
  },
];
