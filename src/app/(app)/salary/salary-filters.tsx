"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

export function SalaryFilters({
  industries,
  seniorityLevels,
  countries,
  metros,
  defaults,
}: {
  industries: Option[];
  seniorityLevels: { rank: number; name: string }[];
  countries: Option[];
  metros: Option[];
  defaults: { q?: string; industry?: string; rank?: string; country?: string; metro?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(defaults.q ?? "");

  const update = React.useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  React.useEffect(() => {
    const timeout = setTimeout(() => update({ q: q || undefined }), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative lg:col-span-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search role title..." className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Select value={defaults.industry ?? "all"} onValueChange={(v) => update({ industry: v === "all" ? undefined : v })}>
        <SelectTrigger>
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All industries</SelectItem>
          {industries.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={defaults.rank ?? "4"} onValueChange={(v) => update({ rank: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Seniority" />
        </SelectTrigger>
        <SelectContent>
          {seniorityLevels.map((s) => (
            <SelectItem key={s.rank} value={String(s.rank)}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={defaults.country ?? "US"}
        onValueChange={(v) => update({ country: v, metro: undefined })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={defaults.metro ?? "none"}
        onValueChange={(v) => update({ metro: v === "none" ? undefined : v })}
        disabled={(defaults.country ?? "US") !== "US"}
      >
        <SelectTrigger>
          <SelectValue placeholder="Metro (cost-of-living adjust)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">National average</SelectItem>
          {metros.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
