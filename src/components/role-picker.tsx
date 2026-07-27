"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
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
}

export function RolePicker({
  basePath,
  paramName,
  currentSlug,
  currentTitle,
}: {
  basePath: string;
  paramName: string;
  currentSlug?: string;
  currentTitle?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const select = (slug: string) => {
    setOpen(false);
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, slug);
    router.push(`${basePath === pathname ? pathname : basePath}?${params.toString()}`);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="justify-between min-w-56">
        <span className="truncate">{currentTitle ?? currentSlug ?? "Select a role"}</span>
        <ChevronsUpDown className="size-4 opacity-50 shrink-0" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for a role..." value={query} onValueChange={setQuery} />
        <CommandList>
          {query && visibleResults.length === 0 && <CommandEmpty>No roles found.</CommandEmpty>}
          <CommandGroup>
            {visibleResults.map((r) => (
              <CommandItem key={r.slug} value={r.slug} onSelect={() => select(r.slug)}>
                <div className="flex flex-col">
                  <span className="text-sm">{r.title}</span>
                  <span className="text-xs text-muted-foreground">{r.industry}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
