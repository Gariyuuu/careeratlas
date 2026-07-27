import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubindustryDetail } from "@/lib/data/industries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function SubindustryDetailPage({
  params,
}: {
  params: Promise<{ industry: string; subindustry: string }>;
}) {
  const { industry: industrySlug, subindustry: subSlug } = await params;
  const sub = await getSubindustryDetail(industrySlug, subSlug);
  if (!sub) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/careers">Career Explorer</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/careers/${industrySlug}`}>{sub.industry.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{sub.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader title={sub.name} description={sub.description} />

      <div className="space-y-8">
        {sub.jobFamilies.map((fam) => (
          <div key={fam.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{fam.name}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">{fam.description}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fam.occupations.map((occ) => (
                <Link key={occ.slug} href={`/roles/${occ.slug}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{occ.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-3">{occ.summary}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
