import Link from "next/link";
import { ArrowRight, LineChart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LandingPage() {
  const [industryCount, occupationCount, transitionCount] = await Promise.all([
    prisma.industry.count(),
    prisma.occupation.count(),
    prisma.careerTransition.count(),
  ]);

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LineChart className="size-4.5" />
            </div>
            <span className="font-semibold tracking-tight">CareerAtlas</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Open the app</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              Know what a career actually pays — before, during, and after you make the move.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              CareerAtlas maps salary, career transitions, education ROI, and industry momentum across{" "}
              {industryCount} industries and {occupationCount.toLocaleString()} roles — every figure labeled as
              reported, estimated, forecast, or simulated, never presented as more certain than it is.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Explore the dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/salary">Browse salaries</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <Stat label="Industries" value={industryCount.toString()} />
            <Stat label="Standardized roles" value={occupationCount.toLocaleString()} />
            <Stat label="Mapped career transitions" value={transitionCount.toLocaleString()} />
            <Stat label="Countries covered" value="11" />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="Salary Explorer"
            description="Percentile-based compensation by role, seniority, geography, and remote status — with cost-of-living adjustment."
            href="/salary"
          />
          <Feature
            title="Career Transitions"
            description="See where people in a role go next, what it pays, and exactly what skills to learn first."
            href="/transitions"
          />
          <Feature
            title="Education Impact"
            description="Compare degrees, majors, and bootcamps with a transparent, editable ROI calculator."
            href="/education"
          />
          <Feature
            title="Industry Trends"
            description="A Job Market Momentum Score built from nine adjustable, fully explained factors."
            href="/trends"
          />
          <Feature
            title="Salary Projection"
            description="Model 1, 3, 5, and 10-year outcomes under conservative, expected, and aggressive scenarios."
            href="/projection"
          />
          <Feature
            title="Compare Careers"
            description="Put up to five careers side by side on pay, growth, accessibility, and flexibility."
            href="/compare"
          />
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
            <p>
              CareerAtlas ships with a deterministic simulated dataset so the product is fully explorable out of the
              box, alongside at least one live official connector (U.S. Bureau of Labor Statistics). See the{" "}
              <Link href="/methodology" className="underline underline-offset-2 text-foreground">
                Methodology
              </Link>{" "}
              and{" "}
              <Link href="/data-sources" className="underline underline-offset-2 text-foreground">
                Data Sources
              </Link>{" "}
              pages for exactly what&apos;s real, what&apos;s estimated, and what&apos;s simulated.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>CareerAtlas — a demo career analytics platform.</span>
          <div className="flex gap-4">
            <Link href="/methodology" className="hover:text-foreground">
              Methodology
            </Link>
            <Link href="/data-sources" className="hover:text-foreground">
              Data Sources
            </Link>
            <Link href="/admin/data-status" className="hover:text-foreground">
              Data Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Feature({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="group rounded-lg border p-5 hover:border-primary/50 hover:shadow-sm transition-all">
      <h3 className="font-medium flex items-center gap-1.5">
        {title}
        <ArrowRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
    </Link>
  );
}
