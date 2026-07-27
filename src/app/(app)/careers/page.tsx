import Link from "next/link";
import * as Icons from "lucide-react";
import { listIndustriesWithCounts } from "@/lib/data/industries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Career Explorer — CareerAtlas" };

export default async function CareersPage() {
  const industries = await listIndustriesWithCounts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Explorer"
        description="Browse 50 industries down to subindustries, job families, and individual roles."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => {
          const Icon = (Icons[toPascalCase(industry.icon) as keyof typeof Icons] as Icons.LucideIcon) ?? Icons.Briefcase;
          return (
            <Link key={industry.slug} href={`/careers/${industry.slug}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all">
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted shrink-0">
                      <Icon className="size-4.5 text-foreground/80" />
                    </div>
                    <CardTitle className="text-sm font-semibold leading-snug">{industry.name}</CardTitle>
                  </div>
                  {industry.momentumScore !== null && (
                    <Badge variant={industry.momentumScore >= 60 ? "default" : "secondary"} className="shrink-0">
                      {industry.momentumScore}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{industry.description}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{industry.subindustryCount} subindustries</span>
                    <span>·</span>
                    <span>{industry.occupationCount} roles</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function toPascalCase(kebab: string | null): string {
  if (!kebab) return "Briefcase";
  return kebab
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}
