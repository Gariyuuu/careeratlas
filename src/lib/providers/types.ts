/**
 * Provider interface every data connector implements — official government
 * sources (BLS, Census, College Scorecard, ...) or licensed commercial
 * providers alike. New sources plug in without touching the rest of the app:
 * implement this interface, register the connector in `registry.ts`, and add
 * a matching row to `src/lib/seed-data/data-sources.ts`.
 */
export interface ImportReport {
  status: "success" | "partial" | "failed";
  rowsImported: number;
  rowsRejected: number;
  warnings: string[];
  errorMessage?: string;
}

export interface DataProvider<TRaw = unknown, TNormalized = unknown> {
  /** Unique slug matching a DataSource row. */
  slug: string;
  /** True if the connector can run with the current environment (API keys, etc). */
  isConfigured(): boolean;
  /** Fetch raw data from the external source. */
  fetchData(): Promise<TRaw>;
  /** Convert raw source data into CareerAtlas's internal shape. */
  normalizeData(raw: TRaw): TNormalized[];
  /** Validate normalized rows; returns only the rows that pass, plus rejection reasons. */
  validateData(rows: TNormalized[]): { valid: TNormalized[]; rejected: number; warnings: string[] };
  /** Persist validated rows (upsert semantics — never deletes prior valid data on failure). */
  upsertData(rows: TNormalized[]): Promise<number>;
}

export async function runProvider(provider: DataProvider): Promise<ImportReport> {
  if (!provider.isConfigured()) {
    return { status: "failed", rowsImported: 0, rowsRejected: 0, warnings: [], errorMessage: "not_configured" };
  }
  try {
    const raw = await provider.fetchData();
    const normalized = provider.normalizeData(raw);
    const { valid, rejected, warnings } = provider.validateData(normalized);
    const rowsImported = await provider.upsertData(valid);
    return {
      status: rejected > 0 ? "partial" : "success",
      rowsImported,
      rowsRejected: rejected,
      warnings,
    };
  } catch (err) {
    return {
      status: "failed",
      rowsImported: 0,
      rowsRejected: 0,
      warnings: [],
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
