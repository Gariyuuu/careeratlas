"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface SearchResult {
  slug: string;
  title: string;
  industry: string;
  matchedAlias?: string;
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!query) return;
    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results ?? []))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const visibleResults = query ? results : [];

  const select = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/roles/${slug}`);
  };

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-full max-w-sm justify-start text-muted-foreground font-normal gap-2"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Search roles, e.g. &ldquo;SWE&rdquo; or &ldquo;Data Scientist&rdquo;
        <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search roles, titles, or abbreviations..." value={query} onValueChange={setQuery} />
        <CommandList>
          {!loading && query && visibleResults.length === 0 && <CommandEmpty>No roles found for &ldquo;{query}&rdquo;.</CommandEmpty>}
          <CommandGroup heading={visibleResults.length ? "Roles" : undefined}>
            {visibleResults.map((r) => (
              <CommandItem key={r.slug} value={r.slug} onSelect={() => select(r.slug)} className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">
                  {r.title}
                  {r.matchedAlias && <span className="ml-2 text-xs text-muted-foreground">matched &ldquo;{r.matchedAlias}&rdquo;</span>}
                </span>
                <span className="text-xs text-muted-foreground">{r.industry}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
