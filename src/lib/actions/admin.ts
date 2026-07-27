"use server";

import { revalidatePath } from "next/cache";
import { runDataImport } from "@/lib/providers/run-import";

export async function triggerDataImport(slug: string) {
  const report = await runDataImport(slug);
  revalidatePath("/admin/data-status");
  return report;
}
