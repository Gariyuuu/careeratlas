"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSavedOccupation } from "@/lib/actions/saved-occupations";
import { toast } from "sonner";

export function SaveCareerButton({ occupationSlug, initiallySaved = false }: { occupationSlug: string; initiallySaved?: boolean }) {
  const [saved, setSaved] = React.useState(initiallySaved);
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  const onClick = () => {
    startTransition(async () => {
      const result = await toggleSavedOccupation(occupationSlug);
      if ("error" in result) {
        if (result.error === "not_signed_in") {
          toast("Sign in to save careers", { action: { label: "Sign in", onClick: () => router.push("/sign-in") } });
        }
        return;
      }
      setSaved(result.saved);
      toast(result.saved ? "Saved to your careers" : "Removed from saved careers");
    });
  };

  return (
    <Button variant="outline" onClick={onClick} disabled={pending}>
      {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      {saved ? "Saved" : "Save career"}
    </Button>
  );
}
