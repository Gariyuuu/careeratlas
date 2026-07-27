"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerDataImport } from "@/lib/actions/admin";
import { toast } from "sonner";

export function RunImportButton({ slug }: { slug: string }) {
  const [pending, startTransition] = React.useTransition();

  const onClick = () => {
    startTransition(async () => {
      const report = await triggerDataImport(slug);
      if (report.status === "failed") {
        toast.error(`Import failed: ${report.errorMessage ?? "unknown error"}`);
      } else {
        toast.success(`Import ${report.status}: ${report.rowsImported} rows imported`);
      }
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
      Run now
    </Button>
  );
}
