"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveComparison } from "@/lib/actions/comparisons";
import { toast } from "sonner";

export function SaveComparisonButton({ slugs }: { slugs: string[] }) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  const onClick = () => {
    startTransition(async () => {
      const result = await saveComparison(slugs);
      if ("error" in result) {
        if (result.error === "not_signed_in") {
          toast("Sign in to save comparisons", { action: { label: "Sign in", onClick: () => router.push("/sign-in") } });
        }
        return;
      }
      toast.success("Comparison saved");
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending || slugs.length === 0}>
      <Save className="size-3.5" /> Save comparison
    </Button>
  );
}
