import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Case-insensitive title/alias search. SQLite's `contains` filter is
// case-sensitive, so we do the match in-memory — the occupation catalog is
// small enough (~1-2k rows) that this stays fast without a search index.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 1) return NextResponse.json({ results: [] });

  const occupations = await prisma.occupation.findMany({
    select: {
      slug: true,
      title: true,
      jobFamily: { select: { subindustry: { select: { industry: { select: { name: true } } } } } },
      aliases: { select: { alias: true } },
    },
  });

  const results: { slug: string; title: string; industry: string; matchedAlias?: string }[] = [];
  for (const occ of occupations) {
    const titleMatch = occ.title.toLowerCase().includes(q);
    const alias = occ.aliases.find((a) => a.alias.toLowerCase().includes(q));
    if (titleMatch || alias) {
      results.push({
        slug: occ.slug,
        title: occ.title,
        industry: occ.jobFamily.subindustry.industry.name,
        matchedAlias: !titleMatch ? alias?.alias : undefined,
      });
    }
    if (results.length >= 30) break;
  }

  // Exact / prefix matches first, then alias matches, then substring matches.
  results.sort((a, b) => {
    const score = (r: typeof a) => {
      if (r.title.toLowerCase() === q) return 0;
      if (r.matchedAlias?.toLowerCase() === q) return 1;
      if (r.title.toLowerCase().startsWith(q)) return 2;
      return 3;
    };
    return score(a) - score(b);
  });

  return NextResponse.json({ results: results.slice(0, 10) });
}
