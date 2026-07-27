import { listAllEducationOutcomesForCompare } from "@/lib/data/education";
import { PageHeader } from "@/components/page-header";
import { EducationCompareTool } from "./education-compare-tool";
import { DEGREE_LEVEL_LABELS, type DegreeLevel } from "@/lib/seed-data/education";

export const metadata = { title: "Compare Education Paths — CareerAtlas" };

export default async function EducationComparePage() {
  const outcomes = await listAllEducationOutcomesForCompare();

  const options = outcomes.map((o) => ({
    id: o.id,
    label: `${o.major.name} — ${DEGREE_LEVEL_LABELS[o.degreeLevel as DegreeLevel] ?? o.degreeLevel}`,
    degreeLevel: o.degreeLevel,
    entrySalaryMedian: o.entrySalaryMedian,
    tenYearReturnPct: o.tenYearReturnPct,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare Education Paths"
        description="Compare up to four education profiles — degree vs. no degree, major vs. major, or school type vs. school type — with editable cost and ROI assumptions."
      />
      <EducationCompareTool options={options} />
    </div>
  );
}
