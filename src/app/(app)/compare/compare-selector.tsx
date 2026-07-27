"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchResult {
  slug: string;
  title: string;
  industry: string;
}

export function CompareSelector({ current }: { current: { slug: string; title: string }[] }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!query) return;
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results ?? []));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const visibleResults = query ? results : [];

  const push = (slugs: string[]) => {
    router.push(`${pathname}?roles=${slugs.join(",")}`);
  };

  const add = (slug: string) => {
    setOpen(false);
    setQuery("");
    if (current.some((c) => c.slug === slug) || current.length >= 5) return;
    push([...current.map((c) => c.slug), slug]);
  };

  const remove = (slug: string) => {
    push(current.filter((c) => c.slug !== slug).map((c) => c.slug));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {current.map((c) => (
        <Badge key={c.slug} variant="secondary" className="gap-1 pr-1">
          {c.title}
          <button onClick={() => remove(c.slug)} aria-label={`Remove ${c.title}`} className="rounded-full hover:bg-background/50 p-0.5">
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {current.length < 5 && (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" /> Add role
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for a role to compare..." value={query} onValueChange={setQuery} />
        <CommandList>
          {query && visibleResults.length === 0 && <CommandEmpty>No roles found.</CommandEmpty>}
          <CommandGroup>
            {visibleResults.map((r) => (
              <CommandItem key={r.slug} value={r.slug} onSelect={() => add(r.slug)}>
                <div className="flex flex-col">
                  <span className="text-sm">{r.title}</span>
                  <span className="text-xs text-muted-foreground">{r.industry}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
