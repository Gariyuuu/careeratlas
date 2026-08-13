"use server";

import { revalidatePath } from "next/cache";
import { runDataImport } from "@/lib/providers/run-import";
import { isAdminSession } from "@/lib/admin-auth";
import type { ImportReport } from "@/lib/providers/types";

export async function triggerDataImport(slug: string): Promise<ImportReport> {
  if (!(await isAdminSession())) {
    // Deliberately console.warn (the only logging call in this codebase —
    // see CLAUDE.md's "no console.* in src/" convention): an auth denial
    // must be distinguishable in Vercel's logs from a real provider
    // failure, since both otherwise return the same status:"failed" shape.
    console.warn(`[admin] Unauthorized triggerDataImport call denied (slug=${slug})`);
    return { status: "failed", rowsImported: 0, rowsRejected: 0, warnings: [], errorMessage: "Not authorized." };
  }

  const report = await runDataImport(slug);
  revalidatePath("/admin/data-status");
  return report;
}
