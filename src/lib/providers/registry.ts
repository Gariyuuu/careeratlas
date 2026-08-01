import type { DataProvider } from "./types";
import { blsAverageHourlyEarningsProvider } from "./bls-provider";
import { blsOewsProvider } from "./bls-oews-provider";
import { onetProvider } from "./onet-provider";
import { revelioRplsProvider } from "./revelio-rpls-provider";
import { collegeScorecardProvider } from "./college-scorecard-provider";
import { censusAcsProvider } from "./census-acs-provider";

// Register additional connectors here as they're implemented (World Bank,
// OECD, ...). Each just needs to satisfy `DataProvider` and have a matching
// row in data-sources.ts.
export const PROVIDER_REGISTRY: DataProvider[] = [
  blsAverageHourlyEarningsProvider,
  blsOewsProvider,
  onetProvider,
  revelioRplsProvider,
  collegeScorecardProvider,
  censusAcsProvider,
];
