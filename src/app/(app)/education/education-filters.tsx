"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEGREE_LEVELS, DEGREE_LEVEL_LABELS } from "@/lib/seed-data/education";

export function EducationFilters({ majors, defaults }: { majors: { slug: string; name: string }[]; defaults: { major?: string; degree?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
      <Select value={defaults.major ?? "all"} onValueChange={(v) => update({ major: v === "all" ? undefined : v })}>
        <SelectTrigger>
          <SelectValue placeholder="Major" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All majors</SelectItem>
          {majors.map((m) => (
            <SelectItem key={m.slug} value={m.slug}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={defaults.degree ?? "all"} onValueChange={(v) => update({ degree: v === "all" ? undefined : v })}>
        <SelectTrigger>
          <SelectValue placeholder="Degree level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All degree levels</SelectItem>
          {DEGREE_LEVELS.map((d) => (
            <SelectItem key={d} value={d}>
              {DEGREE_LEVEL_LABELS[d]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
