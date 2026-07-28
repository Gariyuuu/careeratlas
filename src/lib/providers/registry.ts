import type { DataProvider } from "./types";
import { blsAverageHourlyEarningsProvider } from "./bls-provider";
import { blsOewsProvider } from "./bls-oews-provider";

// Register additional connectors here as they're implemented (Census ACS,
// College Scorecard, O*NET, World Bank, ...). Each just needs to satisfy
// `DataProvider` and have a matching row in data-sources.ts.
export const PROVIDER_REGISTRY: DataProvider[] = [blsAverageHourlyEarningsProvider, blsOewsProvider];
