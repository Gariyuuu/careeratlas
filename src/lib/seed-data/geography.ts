export interface CountrySeed {
  code: string;
  name: string;
  currencyCode: string;
  supportLevel: "full" | "partial" | "seed";
}

// United States has the deepest (still seed/simulated) coverage; the rest
// are included so the country selector and schema are proven out, but carry
// far fewer observations — clearly marked "seed" support level in the UI.
export const COUNTRIES: CountrySeed[] = [
  { code: "US", name: "United States", currencyCode: "USD", supportLevel: "full" },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP", supportLevel: "partial" },
  { code: "CA", name: "Canada", currencyCode: "CAD", supportLevel: "partial" },
  { code: "DE", name: "Germany", currencyCode: "EUR", supportLevel: "seed" },
  { code: "IN", name: "India", currencyCode: "INR", supportLevel: "seed" },
  { code: "AU", name: "Australia", currencyCode: "AUD", supportLevel: "seed" },
  { code: "FR", name: "France", currencyCode: "EUR", supportLevel: "seed" },
  { code: "JP", name: "Japan", currencyCode: "JPY", supportLevel: "seed" },
  { code: "BR", name: "Brazil", currencyCode: "BRL", supportLevel: "seed" },
  { code: "SG", name: "Singapore", currencyCode: "SGD", supportLevel: "seed" },
  { code: "NL", name: "Netherlands", currencyCode: "EUR", supportLevel: "seed" },
];

export interface RegionSeed {
  countryCode: string;
  code: string;
  name: string;
}

export const REGIONS: RegionSeed[] = [
  { countryCode: "US", code: "CA", name: "California" },
  { countryCode: "US", code: "NY", name: "New York" },
  { countryCode: "US", code: "WA", name: "Washington" },
  { countryCode: "US", code: "TX", name: "Texas" },
  { countryCode: "US", code: "MA", name: "Massachusetts" },
  { countryCode: "US", code: "IL", name: "Illinois" },
  { countryCode: "US", code: "CO", name: "Colorado" },
  { countryCode: "US", code: "GA", name: "Georgia" },
  { countryCode: "US", code: "DC", name: "District of Columbia" },
  { countryCode: "US", code: "FL", name: "Florida" },
  { countryCode: "US", code: "NC", name: "North Carolina" },
  { countryCode: "US", code: "MN", name: "Minnesota" },
  { countryCode: "GB", code: "ENG", name: "England" },
  { countryCode: "CA", code: "ON", name: "Ontario" },
];

export interface MetroAreaSeed {
  slug: string;
  name: string;
  regionCode: string; // matches RegionSeed.code within the same country
  countryCode: string;
  costOfLivingIndex: number; // 100 = US national baseline
}

export const METRO_AREAS: MetroAreaSeed[] = [
  { slug: "san-francisco-bay-area", name: "San Francisco Bay Area", regionCode: "CA", countryCode: "US", costOfLivingIndex: 192 },
  { slug: "new-york-city", name: "New York City", regionCode: "NY", countryCode: "US", costOfLivingIndex: 178 },
  { slug: "seattle", name: "Seattle", regionCode: "WA", countryCode: "US", costOfLivingIndex: 152 },
  { slug: "los-angeles", name: "Los Angeles", regionCode: "CA", countryCode: "US", costOfLivingIndex: 149 },
  { slug: "boston", name: "Boston", regionCode: "MA", countryCode: "US", costOfLivingIndex: 148 },
  { slug: "washington-dc", name: "Washington, D.C.", regionCode: "DC", countryCode: "US", costOfLivingIndex: 142 },
  { slug: "austin", name: "Austin", regionCode: "TX", countryCode: "US", costOfLivingIndex: 118 },
  { slug: "denver", name: "Denver", regionCode: "CO", countryCode: "US", costOfLivingIndex: 122 },
  { slug: "chicago", name: "Chicago", regionCode: "IL", countryCode: "US", costOfLivingIndex: 114 },
  { slug: "dallas-fort-worth", name: "Dallas-Fort Worth", regionCode: "TX", countryCode: "US", costOfLivingIndex: 105 },
  { slug: "atlanta", name: "Atlanta", regionCode: "GA", countryCode: "US", costOfLivingIndex: 103 },
  { slug: "miami", name: "Miami", regionCode: "FL", countryCode: "US", costOfLivingIndex: 121 },
  { slug: "raleigh-durham", name: "Raleigh-Durham", regionCode: "NC", countryCode: "US", costOfLivingIndex: 101 },
  { slug: "minneapolis-saint-paul", name: "Minneapolis-Saint Paul", regionCode: "MN", countryCode: "US", costOfLivingIndex: 102 },
  { slug: "london", name: "London", regionCode: "ENG", countryCode: "GB", costOfLivingIndex: 150 },
  { slug: "toronto", name: "Toronto", regionCode: "ON", countryCode: "CA", costOfLivingIndex: 118 },
];
