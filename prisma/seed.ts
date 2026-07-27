import { PrismaClient } from "@prisma/client";
import { projectSalary, PROJECTION_HORIZONS_YEARS, PROJECTION_SCENARIOS } from "../src/lib/scoring/projection";
import { computeCompatibilityScore, computeTransitionDifficulty, classifyTransitionCategory } from "../src/lib/scoring/transition-score";
import { computeMomentumScore, DEFAULT_MOMENTUM_WEIGHTS, type MomentumSubscores } from "../src/lib/scoring/momentum-score";
import { computeConfidence } from "../src/lib/scoring/confidence";

import { INDUSTRIES, type IndustryCategory } from "../src/lib/seed-data/industries";
import { FEATURED_TAXONOMY } from "../src/lib/seed-data/featured-taxonomy";
import { buildGenericTaxonomy } from "../src/lib/seed-data/generic-taxonomy";
import type { IndustryTaxonomySeed, SeniorityTrack } from "../src/lib/seed-data/taxonomy-types";
import { SENIORITY_LEVELS, SENIORITY_RANK_BY_SLUG } from "../src/lib/seed-data/seniority-levels";
import { SENIORITY_TRACK_LEVELS } from "../src/lib/seed-data/taxonomy-types";
import { UNIQUE_SKILLS } from "../src/lib/seed-data/skills";
import { COUNTRIES, REGIONS, METRO_AREAS } from "../src/lib/seed-data/geography";
import { DATA_SOURCES } from "../src/lib/seed-data/data-sources";
import { METHODOLOGY_VERSIONS } from "../src/lib/seed-data/methodology";
import { MAJORS, INSTITUTIONS } from "../src/lib/seed-data/education";
import { createRng, rngInt, rngPick, rngRange, rngSeeded } from "../src/lib/seed-data/rng";
import {
  baseSalaryForRank,
  occupationTierMultiplier,
  COMPANY_SIZE_MULTIPLIER,
  WORK_ARRANGEMENT_MULTIPLIER,
  EQUITY_HEAVY_CATEGORIES,
} from "../src/lib/seed-data/salary-model";

const prisma = new PrismaClient();
const uid = () => crypto.randomUUID();
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const toJson = (v: unknown) => JSON.stringify(v);

async function createManyChunked<T>(label: string, rows: T[], fn: (chunk: T[]) => Promise<unknown>, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    await fn(rows.slice(i, i + size));
  }
  console.log(`  + ${label}: ${rows.length}`);
}

const CATEGORY_GROWTH_BIAS: Record<IndustryCategory, number> = {
  technology: 0.09,
  finance: 0.03,
  "professional-services": 0.04,
  "healthcare-science": 0.07,
  "public-education": 0.02,
  "industrial-energy": 0.02,
  "consumer-retail": -0.01,
  "creative-media": 0.02,
  "trades-services": 0.03,
};

const REMOTE_FRIENDLY_BASE: Record<IndustryCategory, number> = {
  technology: 62,
  finance: 40,
  "professional-services": 45,
  "healthcare-science": 20,
  "public-education": 35,
  "industrial-energy": 15,
  "consumer-retail": 18,
  "creative-media": 42,
  "trades-services": 8,
};

const MAJOR_CATEGORY_BASE_PAY: Record<string, number> = {
  STEM: 68_000,
  Business: 60_000,
  "Social Science": 48_000,
  Humanities: 45_000,
  Health: 58_000,
  General: 40_000,
};

const DEGREE_LEVEL_PAY_MULTIPLIER: Record<string, number> = {
  no_college: 0.62,
  some_college: 0.7,
  self_taught: 0.75,
  certificate: 0.85,
  bootcamp: 0.95,
  trade_school: 0.9,
  associate: 0.8,
  bachelor: 1.0,
  master: 1.22,
  mba: 1.55,
  professional: 1.6,
  doctorate: 1.35,
};

const NO_COLLEGE_BASELINE = 38_000;

// A modest, illustrative certification catalog keyed to the skill that
// implies it. Not exhaustive — this is seed/demo data.
const CERTIFICATIONS: { slug: string; name: string; issuer: string; skillSlug: string }[] = [
  { slug: "aws-certified-solutions-architect", name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", skillSlug: "aws" },
  { slug: "certified-kubernetes-administrator", name: "Certified Kubernetes Administrator", issuer: "CNCF", skillSlug: "kubernetes" },
  { slug: "pmp", name: "Project Management Professional (PMP)", issuer: "PMI", skillSlug: "project-management" },
  { slug: "cfa", name: "Chartered Financial Analyst (CFA)", issuer: "CFA Institute", skillSlug: "portfolio-management" },
  { slug: "frm", name: "Financial Risk Manager (FRM)", issuer: "GARP", skillSlug: "risk-management" },
  { slug: "cpa", name: "Certified Public Accountant (CPA)", issuer: "AICPA", skillSlug: "financial-statement-analysis" },
  { slug: "cissp", name: "Certified Information Systems Security Professional (CISSP)", issuer: "(ISC)²", skillSlug: "application-security" },
  { slug: "ceh", name: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", skillSlug: "penetration-testing" },
  { slug: "six-sigma-green-belt", name: "Six Sigma Green Belt", issuer: "ASQ", skillSlug: "six-sigma" },
  { slug: "shrm-cp", name: "SHRM Certified Professional", issuer: "SHRM", skillSlug: "talent-development" },
  { slug: "google-analytics-certified", name: "Google Analytics Certification", issuer: "Google", skillSlug: "marketing-analytics" },
  { slug: "certified-scrum-master", name: "Certified Scrum Master (CSM)", issuer: "Scrum Alliance", skillSlug: "agile-scrum" },
  { slug: "aws-certified-machine-learning", name: "AWS Certified Machine Learning Specialty", issuer: "Amazon Web Services", skillSlug: "machine-learning" },
  { slug: "cka-security", name: "Certified Cloud Security Professional (CCSP)", issuer: "(ISC)²", skillSlug: "cloud-security" },
  { slug: "rn-license", name: "Registered Nurse (RN) License", issuer: "State Board of Nursing", skillSlug: "patient-care" },
  { slug: "pe-license", name: "Professional Engineer (PE) License", issuer: "NCEES", skillSlug: "structural-analysis" },
  { slug: "osha-30", name: "OSHA 30-Hour Certification", issuer: "OSHA", skillSlug: "equipment-maintenance" },
  { slug: "actuarial-exams-asa", name: "Associate of the Society of Actuaries (ASA)", issuer: "Society of Actuaries", skillSlug: "actuarial-science" },
  { slug: "clinical-research-cra", name: "Certified Clinical Research Associate (CCRA)", issuer: "ACRP", skillSlug: "clinical-trial-design" },
  { slug: "salesforce-admin", name: "Salesforce Certified Administrator", issuer: "Salesforce", skillSlug: "crm-administration" },
];

async function main() {
  console.log("Seeding CareerAtlas (deterministic, simulated demo dataset)...");

  // -------------------------------------------------------------------
  // Reference data
  // -------------------------------------------------------------------
  const seniorityIdBySlug = new Map<string, string>();
  await prisma.seniorityLevel.createMany({
    data: SENIORITY_LEVELS.map((l) => {
      const id = uid();
      seniorityIdBySlug.set(l.slug, id);
      return { id, slug: l.slug, name: l.name, rank: l.rank, description: l.description };
    }),
  });
  console.log(`  + seniority levels: ${SENIORITY_LEVELS.length}`);

  const skillIdBySlug = new Map<string, string>();
  await prisma.skill.createMany({
    data: UNIQUE_SKILLS.map((s) => {
      const id = uid();
      skillIdBySlug.set(s.slug, id);
      return { id, slug: s.slug, name: s.name, category: s.category };
    }),
  });
  console.log(`  + skills: ${UNIQUE_SKILLS.length}`);

  const certIdBySlug = new Map<string, string>();
  await prisma.certification.createMany({
    data: CERTIFICATIONS.map((c) => {
      const id = uid();
      certIdBySlug.set(c.slug, id);
      return { id, slug: c.slug, name: c.name, issuer: c.issuer };
    }),
  });
  console.log(`  + certifications: ${CERTIFICATIONS.length}`);

  const countryIdByCode = new Map<string, string>();
  await prisma.country.createMany({
    data: COUNTRIES.map((c) => {
      const id = uid();
      countryIdByCode.set(c.code, id);
      return { id, code: c.code, name: c.name, currencyCode: c.currencyCode, supportLevel: c.supportLevel };
    }),
  });
  console.log(`  + countries: ${COUNTRIES.length}`);

  const regionIdByKey = new Map<string, string>();
  await prisma.region.createMany({
    data: REGIONS.map((r) => {
      const id = uid();
      regionIdByKey.set(`${r.countryCode}:${r.code}`, id);
      return { id, countryId: countryIdByCode.get(r.countryCode)!, code: r.code, name: r.name };
    }),
  });
  console.log(`  + regions: ${REGIONS.length}`);

  const metroIdBySlug = new Map<string, string>();
  const metroColIndexBySlug = new Map<string, number>();
  await prisma.metroArea.createMany({
    data: METRO_AREAS.map((m) => {
      const id = uid();
      metroIdBySlug.set(m.slug, id);
      metroColIndexBySlug.set(m.slug, m.costOfLivingIndex);
      return { id, slug: m.slug, name: m.name, regionId: regionIdByKey.get(`${m.countryCode}:${m.regionCode}`)! };
    }),
  });
  console.log(`  + metro areas: ${METRO_AREAS.length}`);

  const now = new Date();
  await prisma.costOfLivingIndex.createMany({
    data: METRO_AREAS.map((m) => ({
      id: uid(),
      countryId: countryIdByCode.get(m.countryCode)!,
      metroAreaId: metroIdBySlug.get(m.slug)!,
      index: m.costOfLivingIndex,
      observedAt: now,
      dataStatus: "estimated",
    })),
  });
  // National baseline COL row per country (index 100 for US, rough estimates elsewhere).
  const NATIONAL_COL: Record<string, number> = { US: 100, GB: 118, CA: 104, DE: 108, IN: 42, AU: 122, FR: 112, JP: 110, BR: 55, SG: 128, NL: 115 };
  await prisma.costOfLivingIndex.createMany({
    data: COUNTRIES.map((c) => ({
      id: uid(),
      countryId: countryIdByCode.get(c.code)!,
      index: NATIONAL_COL[c.code] ?? 100,
      observedAt: now,
      dataStatus: "estimated",
    })),
  });
  console.log(`  + cost of living indices: ${METRO_AREAS.length + COUNTRIES.length}`);

  const dataSourceIdBySlug = new Map<string, string>();
  await prisma.dataSource.createMany({
    data: DATA_SOURCES.map((d) => {
      const id = uid();
      dataSourceIdBySlug.set(d.slug, id);
      return {
        id,
        slug: d.slug,
        name: d.name,
        organization: d.organization,
        url: d.url,
        requiresApiKey: d.requiresApiKey,
        apiKeyEnvVar: d.apiKeyEnvVar,
        status: d.requiresApiKey ? "not_configured" : d.slug === "careeratlas-seed" ? "active" : "not_configured",
        description: d.description,
      };
    }),
  });
  const seedSourceId = dataSourceIdBySlug.get("careeratlas-seed")!;
  console.log(`  + data sources: ${DATA_SOURCES.length}`);

  const methodologyIdByName = new Map<string, string>();
  await prisma.methodologyVersion.createMany({
    data: METHODOLOGY_VERSIONS.map((m) => {
      const id = uid();
      methodologyIdByName.set(m.scoreName, id);
      return { id, scoreName: m.scoreName, version: m.version, description: m.description, formula: m.formula };
    }),
  });
  console.log(`  + methodology versions: ${METHODOLOGY_VERSIONS.length}`);

  // -------------------------------------------------------------------
  // Taxonomy: Industry -> Subindustry -> JobFamily -> Occupation
  // -------------------------------------------------------------------
  const featuredSlugs = new Set(FEATURED_TAXONOMY.map((t) => t.industrySlug));
  const nonFeatured = INDUSTRIES.filter((i) => !featuredSlugs.has(i.slug));
  const genericTaxonomy = buildGenericTaxonomy(nonFeatured);
  const allTaxonomy: IndustryTaxonomySeed[] = [...FEATURED_TAXONOMY, ...genericTaxonomy];

  const industryIdBySlug = new Map<string, string>();
  const industryCategoryBySlug = new Map<string, IndustryCategory>();
  await prisma.industry.createMany({
    data: INDUSTRIES.map((i) => {
      const id = uid();
      industryIdBySlug.set(i.slug, id);
      industryCategoryBySlug.set(i.slug, i.category);
      return { id, slug: i.slug, name: i.name, description: i.description, icon: i.icon };
    }),
  });
  console.log(`  + industries: ${INDUSTRIES.length}`);

  interface OccMeta {
    id: string;
    slug: string;
    title: string;
    industrySlug: string;
    category: IndustryCategory;
    jobFamilyId: string;
    track: SeniorityTrack;
    ranks: number[]; // attached seniority ranks, ascending
    referenceRank: number; // middle rank, used for headline salary figures
    skillSlugs: string[]; // in priority order
    automationExposure: number;
    remoteFriendliness: number;
    subindustryId: string;
  }

  const subindustryRows: Record<string, unknown>[] = [];
  const jobFamilyRows: Record<string, unknown>[] = [];
  const occupationRows: Record<string, unknown>[] = [];
  const occupationSeniorityRows: Record<string, unknown>[] = [];
  const occupationAliasRows: Record<string, unknown>[] = [];
  const occupationSkillRows: Record<string, unknown>[] = [];
  const occupationCertRows: Record<string, unknown>[] = [];
  const occupations: OccMeta[] = [];
  const usedSlugs = new Set<string>();

  function uniqueSlug(base: string): string {
    let s = slugify(base);
    let n = 2;
    while (usedSlugs.has(s)) {
      s = `${slugify(base)}-${n++}`;
    }
    usedSlugs.add(s);
    return s;
  }

  for (const tax of allTaxonomy) {
    const industryId = industryIdBySlug.get(tax.industrySlug);
    const category = industryCategoryBySlug.get(tax.industrySlug);
    if (!industryId || !category) continue;

    for (const sub of tax.subindustries) {
      const subindustryId = uid();
      const subSlug = uniqueSlug(`${tax.industrySlug}-${sub.name}`);
      subindustryRows.push({ id: subindustryId, slug: subSlug, name: sub.name, description: sub.description, industryId });

      for (const fam of sub.jobFamilies) {
        const jobFamilyId = uid();
        const famSlug = uniqueSlug(`${tax.industrySlug}-${sub.name}-${fam.name}`);
        jobFamilyRows.push({ id: jobFamilyId, slug: famSlug, name: fam.name, description: fam.description, subindustryId });

        for (const occ of fam.occupations) {
          const occId = uid();
          const occSlug = uniqueSlug(occ.title);
          const levels = SENIORITY_TRACK_LEVELS[occ.seniorityTrack];
          const ranks = levels.map((s) => SENIORITY_RANK_BY_SLUG[s]).sort((a, b) => a - b);
          const referenceRank = ranks[Math.floor(ranks.length / 2)];

          occupationRows.push({
            id: occId,
            slug: occSlug,
            title: occ.title,
            jobFamilyId,
            summary: occ.summary,
            responsibilities: toJson([
              `Contributes to ${fam.description.toLowerCase()}`,
              `Collaborates with cross-functional stakeholders on ${sub.name.toLowerCase()}`,
              `Builds and applies expertise in ${occ.skills[0] ?? "the role's core skills"}`,
            ]),
            automationExposure: occ.automationExposure,
            remoteFriendliness: occ.remoteFriendliness,
          });

          for (const levelSlug of levels) {
            const seniorityLevelId = seniorityIdBySlug.get(levelSlug);
            if (!seniorityLevelId) continue;
            const rank = SENIORITY_RANK_BY_SLUG[levelSlug];
            occupationSeniorityRows.push({
              id: uid(),
              occupationId: occId,
              seniorityLevelId,
              yearsExperienceMin: Math.max(0, rank - 1) * 1.5,
              yearsExperienceMax: rank < 13 ? rank * 1.8 + 1 : null,
            });
          }

          for (const alias of occ.aliases ?? []) {
            occupationAliasRows.push({ id: uid(), occupationId: occId, alias: alias.alias, kind: alias.kind });
          }

          const seenSkillSlugs = new Set<string>();
          const dedupedSkills = occ.skills.filter((skillName) => {
            const s = slugify(skillName);
            if (seenSkillSlugs.has(s)) return false;
            seenSkillSlugs.add(s);
            return true;
          });
          dedupedSkills.forEach((skillName, idx) => {
            const skillId = skillIdBySlug.get(slugify(skillName));
            if (!skillId) return;
            occupationSkillRows.push({
              id: uid(),
              occupationId: occId,
              skillId,
              importance: Math.max(0.3, 0.95 - idx * 0.18),
              isCore: idx < 2,
            });
          });

          for (const cert of CERTIFICATIONS) {
            if (occ.skills.some((s) => slugify(s) === cert.skillSlug)) {
              const rng = createRng(rngSeeded("cert", occSlug, cert.slug));
              occupationCertRows.push({
                id: uid(),
                occupationId: occId,
                certificationId: certIdBySlug.get(cert.slug)!,
                frequency: Math.round(rngRange(rng, 0.15, 0.55) * 100) / 100,
              });
            }
          }

          occupations.push({
            id: occId,
            slug: occSlug,
            title: occ.title,
            industrySlug: tax.industrySlug,
            category,
            jobFamilyId,
            track: occ.seniorityTrack,
            ranks,
            referenceRank,
            skillSlugs: dedupedSkills.map(slugify),
            automationExposure: occ.automationExposure,
            remoteFriendliness: occ.remoteFriendliness,
            subindustryId,
          });
        }
      }
    }
  }

  await createManyChunked("subindustries", subindustryRows, (c) => prisma.subindustry.createMany({ data: c as never }));
  await createManyChunked("job families", jobFamilyRows, (c) => prisma.jobFamily.createMany({ data: c as never }));
  await createManyChunked("occupations", occupationRows, (c) => prisma.occupation.createMany({ data: c as never }));
  await createManyChunked("occupation seniority levels", occupationSeniorityRows, (c) => prisma.occupationSeniority.createMany({ data: c as never }));
  await createManyChunked("occupation aliases", occupationAliasRows, (c) => prisma.occupationAlias.createMany({ data: c as never }));
  await createManyChunked("occupation skills", occupationSkillRows, (c) => prisma.occupationSkill.createMany({ data: c as never }));
  await createManyChunked("occupation certifications", occupationCertRows, (c) => prisma.occupationCertification.createMany({ data: c as never }));

  console.log(`Taxonomy totals — industries: ${INDUSTRIES.length}, subindustries: ${subindustryRows.length}, job families: ${jobFamilyRows.length}, occupations: ${occupationRows.length}`);

  // -------------------------------------------------------------------
  // Industry-level labor market stats + momentum scores
  // -------------------------------------------------------------------
  const industryMomentumBySlug = new Map<string, number>();
  const industryStatRows: Record<string, unknown>[] = [];
  const layoffRows: Record<string, unknown>[] = [];
  const remoteWorkRows: Record<string, unknown>[] = [];
  const momentumRows: Record<string, unknown>[] = [];

  for (const industry of INDUSTRIES) {
    const industryId = industryIdBySlug.get(industry.slug)!;
    const rng = createRng(rngSeeded("industry-stats", industry.slug));
    const growthBias = CATEGORY_GROWTH_BIAS[industry.category];
    const remoteBias = REMOTE_FRIENDLY_BASE[industry.category];

    industryStatRows.push({
      id: uid(),
      industryId,
      year: 2025,
      revenueGrowthPct: Math.round(rngRange(rng, growthBias * 100 - 4, growthBias * 100 + 8) * 10) / 10,
      profitGrowthPct: Math.round(rngRange(rng, growthBias * 100 - 6, growthBias * 100 + 6) * 10) / 10,
      employmentGrowthPct: Math.round(rngRange(rng, growthBias * 100 - 2, growthBias * 100 + 5) * 10) / 10,
      dataStatus: "simulated",
      sourceId: seedSourceId,
    });

    layoffRows.push({
      id: uid(),
      industryId,
      observedAt: now,
      layoffCount: rngInt(rng, 50, growthBias < 0 ? 8000 : 2500),
      companiesAffected: rngInt(rng, 2, 40),
      dataStatus: "simulated",
      sourceId: seedSourceId,
    });

    const remotePct = Math.round(Math.min(80, Math.max(2, rngRange(rng, remoteBias - 12, remoteBias + 12))));
    const hybridPct = Math.round(rngRange(rng, 15, 35));
    const onsitePct = Math.max(0, 100 - remotePct - hybridPct);
    remoteWorkRows.push({
      id: uid(),
      industryId,
      observedAt: now,
      remoteSharePct: remotePct,
      hybridSharePct: hybridPct,
      onsiteSharePct: onsitePct,
      dataStatus: "simulated",
      sourceId: seedSourceId,
    });

    // Four trailing quarterly momentum snapshots so the UI has a trend line.
    for (let q = 3; q >= 0; q--) {
      const qRng = createRng(rngSeeded("momentum", industry.slug, q));
      const drift = q * rngRange(qRng, -1.5, 1.5);
      const subscores: MomentumSubscores = {
        employmentGrowthScore: clamp01to100(50 + growthBias * 300 + rngRange(qRng, -10, 10) - drift),
        postingGrowthScore: clamp01to100(50 + growthBias * 250 + rngRange(qRng, -12, 12) - drift),
        salaryGrowthScore: clamp01to100(50 + growthBias * 200 + rngRange(qRng, -10, 10) - drift),
        hiringVelocityScore: clamp01to100(50 + growthBias * 150 + rngRange(qRng, -15, 15) - drift),
        layoffRiskScore: clamp01to100(60 - growthBias * -100 + rngRange(qRng, -15, 15)),
        skillDemandScore: clamp01to100(50 + growthBias * 220 + rngRange(qRng, -10, 10) - drift),
        automationSafetyScore: clamp01to100(70 - (industry.category === "technology" ? 10 : 0) + rngRange(qRng, -15, 15)),
        entryLevelScore: clamp01to100(50 + rngRange(qRng, -20, 20)),
        geographicDiversityScore: clamp01to100(remoteBias + rngRange(qRng, -10, 10)),
      };
      const result = computeMomentumScore(subscores);
      const observedAt = new Date(now.getTime() - q * 90 * 86_400_000);
      const confidence = computeConfidence({ sampleSize: 400, dataStatus: "simulated", observedAt, now });
      const rowId = uid();
      if (q === 0) industryMomentumBySlug.set(industry.slug, result.score);
      momentumRows.push({
        id: rowId,
        industryId,
        observedAt,
        score: result.score,
        employmentGrowthScore: subscores.employmentGrowthScore,
        postingGrowthScore: subscores.postingGrowthScore,
        salaryGrowthScore: subscores.salaryGrowthScore,
        hiringVelocityScore: subscores.hiringVelocityScore,
        layoffRiskScore: subscores.layoffRiskScore,
        skillDemandScore: subscores.skillDemandScore,
        automationSafetyScore: subscores.automationSafetyScore,
        entryLevelScore: subscores.entryLevelScore,
        geographicDiversityScore: subscores.geographicDiversityScore,
        weights: toJson(DEFAULT_MOMENTUM_WEIGHTS),
        dataStatus: "simulated",
        confidence,
      });
    }
  }

  function clamp01to100(v: number) {
    return Math.round(Math.min(100, Math.max(0, v)));
  }

  await createManyChunked("industry statistics", industryStatRows, (c) => prisma.industryStatistic.createMany({ data: c as never }));
  await createManyChunked("layoff statistics", layoffRows, (c) => prisma.layoffStatistic.createMany({ data: c as never }));
  await createManyChunked("remote work statistics", remoteWorkRows, (c) => prisma.remoteWorkStatistic.createMany({ data: c as never }));
  await createManyChunked("industry momentum scores", momentumRows, (c) => prisma.industryMomentumScore.createMany({ data: c as never }));

  const skillDemandRows = UNIQUE_SKILLS.map((s) => {
    const rng = createRng(rngSeeded("skill-demand", s.slug));
    const growth = rngRange(rng, -15, 45);
    const direction = growth > 25 ? "emerging" : growth > 8 ? "rising" : growth > -3 ? "stable" : "declining";
    return {
      id: uid(),
      skillId: skillIdBySlug.get(s.slug)!,
      observedAt: now,
      demandGrowthPct: Math.round(growth * 10) / 10,
      postingShare: Math.round(rngRange(rng, 0.01, 0.35) * 1000) / 1000,
      trendDirection: direction,
      dataStatus: "simulated",
      sourceId: seedSourceId,
    };
  });
  await createManyChunked("skill demand statistics", skillDemandRows, (c) => prisma.skillDemandStatistic.createMany({ data: c as never }));

  // -------------------------------------------------------------------
  // Occupation-level compensation + labor market data
  // -------------------------------------------------------------------
  const salaryObservationRows: Record<string, unknown>[] = [];
  const salaryPercentileRows: Record<string, unknown>[] = [];
  const salaryHistoryRows: Record<string, unknown>[] = [];
  const salaryForecastRows: Record<string, unknown>[] = [];
  const employmentStatRows: Record<string, unknown>[] = [];
  const jobPostingStatRows: Record<string, unknown>[] = [];
  const eduReqRows: Record<string, unknown>[] = [];

  const usCountryId = countryIdByCode.get("US")!;
  const gbCountryId = countryIdByCode.get("GB")!;
  const caCountryId = countryIdByCode.get("CA")!;
  const workArrangements = ["onsite", "hybrid", "remote"] as const;
  const companySizes = ["startup", "small", "mid", "large", "enterprise"] as const;

  occupations.forEach((occ, idx) => {
    const rng = createRng(rngSeeded("salary", occ.slug));
    const tierMult = occupationTierMultiplier(occ.title, occ.slug);
    const momentum = industryMomentumBySlug.get(occ.industrySlug) ?? 50;

    // Percentiles at every attached seniority rank.
    for (const rank of occ.ranks) {
      const median = baseSalaryForRank(occ.category, rank) * tierMult;
      const sampleSize = rngInt(rng, 20, 900);
      salaryPercentileRows.push({
        id: uid(),
        occupationId: occ.id,
        countryId: usCountryId,
        seniorityRank: rank,
        p10: Math.round(median * 0.76),
        p25: Math.round(median * 0.88),
        median: Math.round(median),
        p75: Math.round(median * 1.16),
        p90: Math.round(median * 1.38),
        mean: Math.round(median * 1.04),
        observedAt: now,
        dataStatus: "simulated",
        sampleSize,
        confidence: computeConfidence({ sampleSize, dataStatus: "simulated", observedAt: now, now }),
        sourceId: seedSourceId,
      });
    }

    // Sample GB/CA percentile for ~1 in 5 occupations at the reference rank.
    if (idx % 5 === 0) {
      const refMedianUsd = baseSalaryForRank(occ.category, occ.referenceRank) * tierMult;
      const gbMedian = refMedianUsd * 0.83 * 0.79; // pay-level factor x rough USD->GBP
      const caMedian = refMedianUsd * 0.88 * 1.36; // pay-level factor x rough USD->CAD
      for (const [countryId, median] of [
        [gbCountryId, gbMedian],
        [caCountryId, caMedian],
      ] as const) {
        salaryPercentileRows.push({
          id: uid(),
          occupationId: occ.id,
          countryId,
          seniorityRank: occ.referenceRank,
          p10: Math.round(median * 0.76),
          p25: Math.round(median * 0.88),
          median: Math.round(median),
          p75: Math.round(median * 1.16),
          p90: Math.round(median * 1.38),
          mean: Math.round(median * 1.04),
          observedAt: now,
          dataStatus: "simulated",
          sampleSize: rngInt(rng, 15, 200),
          confidence: computeConfidence({ sampleSize: 60, dataStatus: "simulated", observedAt: now, now }),
          sourceId: seedSourceId,
        });
      }
    }

    // Raw observations at the reference rank across work arrangements.
    const refMedian = baseSalaryForRank(occ.category, occ.referenceRank) * tierMult;
    for (const arrangement of workArrangements) {
      const companySize = rngPick(rng, companySizes);
      const base = refMedian * WORK_ARRANGEMENT_MULTIPLIER[arrangement] * COMPANY_SIZE_MULTIPLIER[companySize] * rngRange(rng, 0.93, 1.07);
      const isEquityHeavy = EQUITY_HEAVY_CATEGORIES.includes(occ.category);
      const bonus = Math.round(base * rngRange(rng, 0.03, 0.15));
      const equity = isEquityHeavy ? Math.round(base * rngRange(rng, 0.05, 0.35)) : 0;
      salaryObservationRows.push({
        id: uid(),
        occupationId: occ.id,
        countryId: usCountryId,
        seniorityRank: occ.referenceRank,
        workArrangement: arrangement,
        companySize,
        employmentType: "full_time",
        baseSalary: Math.round(base),
        bonus,
        equity,
        commission: 0,
        totalComp: Math.round(base + bonus + equity),
        sampleSize: rngInt(rng, 8, 150),
        observedAt: now,
        dataStatus: "simulated",
        confidence: computeConfidence({ sampleSize: 40, dataStatus: "simulated", observedAt: now, now }),
        sourceId: seedSourceId,
      });
    }

    // Five-year salary history at the reference rank.
    let runningMedian = refMedian / Math.pow(1.032, 4);
    for (let yearOffset = 4; yearOffset >= 0; yearOffset--) {
      const year = 2025 - yearOffset;
      const yoy = yearOffset === 4 ? null : Math.round((runningMedian / (runningMedian / 1.032) - 1) * 1000) / 10;
      salaryHistoryRows.push({
        id: uid(),
        occupationId: occ.id,
        countryId: usCountryId,
        year,
        medianTotalComp: Math.round(runningMedian),
        yoyChangePct: yoy,
        dataStatus: "simulated",
        sourceId: seedSourceId,
      });
      runningMedian *= 1.028 + (momentum - 50) / 4000;
    }

    // Forecasts using the app's own transparent projection model.
    const occupationGrowthPct = CATEGORY_GROWTH_BIAS[occ.category] + rngRange(rng, -0.02, 0.03);
    const skillDemandScore = clamp01to100(momentum + rngRange(rng, -10, 10)) / 100;
    for (const scenario of PROJECTION_SCENARIOS) {
      for (const yearsOut of PROJECTION_HORIZONS_YEARS) {
        const projection = projectSalary({
          currentSalary: refMedian,
          yearsOut,
          scenario,
          generalWageGrowthPct: 0.032,
          occupationGrowthPct,
          industryMomentumScore: momentum,
          yearsExperience: Math.max(1, occ.referenceRank * 1.5),
          educationFactor: 0.6,
          skillDemandScore,
          promotionOrTransitionProbability: 0.35,
        });
        salaryForecastRows.push({
          id: uid(),
          occupationId: occ.id,
          countryId: usCountryId,
          yearsOut,
          scenario,
          projectedTotalComp: projection.projectedSalary,
          methodologyVersionId: methodologyIdByName.get("salary_projection"),
          generatedAt: now,
          dataStatus: "forecast",
        });
      }
    }

    // Employment + job posting statistics.
    const employedCount = rngInt(rng, 800, occ.category === "technology" || occ.category === "healthcare-science" ? 400_000 : 150_000);
    employmentStatRows.push({
      id: uid(),
      occupationId: occ.id,
      countryId: usCountryId,
      year: 2025,
      employedCount,
      projectedGrowthPct: Math.round(occupationGrowthPct * 1000) / 10,
      openingsPerYear: Math.round(employedCount * rngRange(rng, 0.04, 0.12)),
      dataStatus: "simulated",
      sourceId: seedSourceId,
    });
    jobPostingStatRows.push({
      id: uid(),
      occupationId: occ.id,
      observedAt: now,
      activeOpenings: rngInt(rng, 5, 12_000),
      postingGrowthPct: Math.round(rngRange(rng, -20, 35) * 10) / 10,
      medianDaysToFill: rngInt(rng, 14, 75),
      dataStatus: "simulated",
      sourceId: seedSourceId,
    });

    // Education requirements — three plausible degree levels per occupation.
    const eduRng = createRng(rngSeeded("edu-req", occ.slug));
    const degreeCandidates: [string, number, number][] =
      occ.category === "trades-services"
        ? [
            ["trade_school", 0.45, 0.3],
            ["certificate", 0.25, 0.2],
            ["no_college", 0.2, 0.1],
          ]
        : occ.track === "executive" || occ.referenceRank >= 9
          ? [
              ["bachelor", 0.55, 0.25],
              ["mba", 0.2, 0.35],
              ["master", 0.15, 0.25],
            ]
          : [
              ["bachelor", 0.6, 0.25],
              ["master", 0.15, 0.3],
              ["no_college", 0.15, 0.1],
            ];
    for (const [level, requires, prefers] of degreeCandidates) {
      eduReqRows.push({
        id: uid(),
        occupationId: occ.id,
        degreeLevel: level,
        requiresPct: Math.round(rngRange(eduRng, requires - 0.08, requires + 0.08) * 100) / 100,
        prefersPct: Math.round(rngRange(eduRng, prefers - 0.05, prefers + 0.05) * 100) / 100,
        dataStatus: "simulated",
        sourceId: seedSourceId,
      });
    }
  });

  await createManyChunked("salary percentiles", salaryPercentileRows, (c) => prisma.salaryPercentile.createMany({ data: c as never }));
  await createManyChunked("salary observations", salaryObservationRows, (c) => prisma.salaryObservation.createMany({ data: c as never }));
  await createManyChunked("salary history", salaryHistoryRows, (c) => prisma.salaryHistory.createMany({ data: c as never }));
  await createManyChunked("salary forecasts", salaryForecastRows, (c) => prisma.salaryForecast.createMany({ data: c as never }));
  await createManyChunked("employment statistics", employmentStatRows, (c) => prisma.employmentStatistic.createMany({ data: c as never }));
  await createManyChunked("job posting statistics", jobPostingStatRows, (c) => prisma.jobPostingStatistic.createMany({ data: c as never }));
  await createManyChunked("occupation education requirements", eduReqRows, (c) => prisma.occupationEducationRequirement.createMany({ data: c as never }));

  // -------------------------------------------------------------------
  // Education: institutions, majors, programs, outcomes, costs
  // -------------------------------------------------------------------
  const majorIdBySlug = new Map<string, string>();
  await prisma.major.createMany({
    data: MAJORS.map((m) => {
      const id = uid();
      majorIdBySlug.set(m.slug, id);
      return { id, slug: m.slug, name: m.name, category: m.category };
    }),
  });
  console.log(`  + majors: ${MAJORS.length}`);

  const institutionIdBySlug = new Map<string, string>();
  await prisma.institution.createMany({
    data: INSTITUTIONS.map((i) => {
      const id = uid();
      institutionIdBySlug.set(i.slug, id);
      return {
        id,
        slug: i.slug,
        name: i.name,
        countryId: countryIdByCode.get(i.countryCode)!,
        control: i.control,
        levelType: i.levelType,
        annualTuitionInState: i.annualTuitionInState,
        annualTuitionOutState: i.annualTuitionOutState,
      };
    }),
  });
  console.log(`  + institutions: ${INSTITUTIONS.length}`);

  const collegeCostRows: Record<string, unknown>[] = INSTITUTIONS.flatMap((i) => {
    const institutionId = institutionIdBySlug.get(i.slug)!;
    const cost = i.annualTuitionInState ?? 15000;
    switch (i.levelType) {
      case "four_year":
        return [
          { id: uid(), institutionId, degreeLevel: "bachelor", totalCost: Math.round(cost * 4), years: 4, dataStatus: "estimated", sourceId: seedSourceId },
          { id: uid(), institutionId, degreeLevel: "master", totalCost: Math.round(cost * 2), years: 2, dataStatus: "estimated", sourceId: seedSourceId },
        ];
      case "two_year":
        return [{ id: uid(), institutionId, degreeLevel: "associate", totalCost: Math.round(cost * 2), years: 2, dataStatus: "estimated", sourceId: seedSourceId }];
      case "bootcamp":
        return [{ id: uid(), institutionId, degreeLevel: "bootcamp", totalCost: Math.round(cost), years: 0.5, dataStatus: "estimated", sourceId: seedSourceId }];
      case "trade_school":
        return [{ id: uid(), institutionId, degreeLevel: "trade_school", totalCost: Math.round(cost), years: 1, dataStatus: "estimated", sourceId: seedSourceId }];
      default:
        return [];
    }
  });
  await createManyChunked("college costs", collegeCostRows, (c) => prisma.collegeCost.createMany({ data: c as never }));

  const educationOutcomeRows: Record<string, unknown>[] = [];
  for (const major of MAJORS) {
    const majorId = majorIdBySlug.get(major.slug)!;
    const basePay = MAJOR_CATEGORY_BASE_PAY[major.category] ?? 50_000;
    const rng = createRng(rngSeeded("edu-outcome", major.slug));

    const levels: string[] = ["bachelor"];
    if (major.category !== "General") levels.push("master");
    if (major.category === "Business") levels.push("mba");
    if (major.category === "STEM" || major.category === "Health") levels.push("doctorate");
    if (["STEM", "Business", "Health"].includes(major.category)) levels.push("associate");
    if (major.category === "General") levels.push("no_college", "some_college", "self_taught", "trade_school");
    if (["computer-science", "data-science"].includes(major.slug)) levels.push("bootcamp", "certificate");

    for (const level of levels) {
      const mult = DEGREE_LEVEL_PAY_MULTIPLIER[level] ?? 1;
      const entrySalaryMedian = Math.round(basePay * mult * rngRange(rng, 0.95, 1.08));
      const sampleSize = rngInt(rng, 40, 3000);
      educationOutcomeRows.push({
        id: uid(),
        majorId,
        degreeLevel: level,
        entrySalaryMedian,
        salaryPremiumPct: Math.round(((entrySalaryMedian - NO_COLLEGE_BASELINE) / NO_COLLEGE_BASELINE) * 1000) / 10,
        timeToFirstRoleMonths: Math.round(rngRange(rng, 1.5, 8) * 10) / 10,
        employmentRatePct: Math.round(rngRange(rng, 78, 97) * 10) / 10,
        tenYearReturnPct: Math.round(rngRange(rng, 40, 320) * 10) / 10,
        twentyYearReturnPct: Math.round(rngRange(rng, 150, 700) * 10) / 10,
        sampleSize,
        dataStatus: "simulated",
        confidence: computeConfidence({ sampleSize, dataStatus: "simulated", observedAt: now, now }),
        sourceId: seedSourceId,
      });
    }
  }
  await createManyChunked("education outcomes", educationOutcomeRows, (c) => prisma.educationOutcome.createMany({ data: c as never }));

  // -------------------------------------------------------------------
  // Career transitions
  // -------------------------------------------------------------------
  const occByFamily = new Map<string, OccMeta[]>();
  const occBySubindustry = new Map<string, OccMeta[]>();
  for (const occ of occupations) {
    if (!occByFamily.has(occ.jobFamilyId)) occByFamily.set(occ.jobFamilyId, []);
    occByFamily.get(occ.jobFamilyId)!.push(occ);
    if (!occBySubindustry.has(occ.subindustryId)) occBySubindustry.set(occ.subindustryId, []);
    occBySubindustry.get(occ.subindustryId)!.push(occ);
  }

  const transitionRows: Record<string, unknown>[] = [];
  const skillGapRows: Record<string, unknown>[] = [];
  const seenPairs = new Set<string>();

  for (const source of occupations) {
    const candidatesMap = new Map<string, OccMeta>();
    for (const c of occByFamily.get(source.jobFamilyId) ?? []) if (c.id !== source.id) candidatesMap.set(c.id, c);
    for (const c of occBySubindustry.get(source.subindustryId) ?? []) if (c.id !== source.id) candidatesMap.set(c.id, c);
    const candidates = [...candidatesMap.values()];
    if (candidates.length === 0) continue;

    const sourceSkills = new Set(source.skillSlugs);
    const scored = candidates
      .map((target) => {
        const targetSkills = new Set(target.skillSlugs);
        const intersection = [...sourceSkills].filter((s) => targetSkills.has(s));
        const union = new Set([...sourceSkills, ...targetSkills]);
        const overlap = union.size === 0 ? 0 : intersection.length / union.size;
        const sameFamily = target.jobFamilyId === source.jobFamilyId ? 0.15 : 0;
        return { target, overlap: Math.min(1, overlap + sameFamily) };
      })
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 5);

    for (const { target, overlap } of scored) {
      const pairKey = `${source.id}:${target.id}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const rng = createRng(rngSeeded("transition", source.slug, target.slug));
      const sourceSalary = baseSalaryForRank(source.category, source.referenceRank) * occupationTierMultiplier(source.title, source.slug);
      const targetSalary = baseSalaryForRank(target.category, target.referenceRank) * occupationTierMultiplier(target.title, target.slug);
      const salaryDeltaPct = Math.round(((targetSalary - sourceSalary) / sourceSalary) * 1000) / 10;
      const seniorityJump = target.referenceRank - source.referenceRank;
      const educationOverlap = source.category === target.category ? 0.75 : 0.45;
      const experienceOverlap = 1 - Math.min(1, Math.abs(seniorityJump) / 6);
      const industrySimilarity = source.industrySlug === target.industrySlug ? (source.jobFamilyId === target.jobFamilyId ? 1 : 0.75) : 0.3;

      const compatibility = computeCompatibilityScore({ skillOverlap: overlap, educationOverlap, experienceOverlap, industrySimilarity });
      const targetSkillSet = new Set(target.skillSlugs);
      const missingSkills = target.skillSlugs.filter((s) => !sourceSkills.has(s));
      const transferableSkills = target.skillSlugs.filter((s) => sourceSkills.has(s));
      const difficulty = computeTransitionDifficulty({ skillOverlap: overlap, educationOverlap, seniorityJump, missingSkillCount: missingSkills.length });
      const demandScore = clamp01to100((industryMomentumBySlug.get(target.industrySlug) ?? 50) + rngRange(rng, -10, 10));
      const opportunityScore = clamp01to100(demandScore * 0.5 + (salaryDeltaPct > 0 ? Math.min(30, salaryDeltaPct) : 0) + (100 - difficulty) * 0.2);
      const confidenceScore = clamp01to100(50 + overlap * 40 + rngRange(rng, -5, 5));
      const category = classifyTransitionCategory({ salaryDeltaPct, transitionDifficulty: difficulty, demandScore, seniorityJump });

      const transitionId = uid();
      transitionRows.push({
        id: transitionId,
        fromOccupationId: source.id,
        toOccupationId: target.id,
        category,
        salaryDeltaPct,
        transitionDifficulty: difficulty,
        opportunityScore,
        demandScore,
        confidenceScore,
        compatibilityScore: compatibility.compatibilityScore,
        typicalTransitionMonths: Math.round(rngRange(rng, 2, 3 + difficulty / 12) * 10) / 10,
        educationCommonlyRequired: toJson(source.category === target.category ? ["bachelor"] : ["bachelor", "master"]),
        postingCoOccurrence: Math.round(overlap * 100) / 100,
        dataStatus: "simulated",
        sourceId: seedSourceId,
      });

      for (const skillSlug of missingSkills.slice(0, 3)) {
        const skillId = skillIdBySlug.get(skillSlug);
        if (!skillId) continue;
        skillGapRows.push({
          id: uid(),
          transitionId,
          skillId,
          gapType: "missing",
          postingFrequency: Math.round(rngRange(rng, 0.3, 0.85) * 100) / 100,
          salaryValue: Math.round(rngRange(rng, 0.2, 0.9) * 100) / 100,
          demandGrowth: Math.round(rngRange(rng, 0.1, 0.7) * 100) / 100,
          monthsToLearn: Math.round(rngRange(rng, 1, 9) * 10) / 10,
        });
      }
      for (const skillSlug of transferableSkills.slice(0, 2)) {
        const skillId = skillIdBySlug.get(skillSlug);
        if (!skillId || !targetSkillSet.has(skillSlug)) continue;
        skillGapRows.push({
          id: uid(),
          transitionId,
          skillId,
          gapType: "transferable",
          postingFrequency: Math.round(rngRange(rng, 0.4, 0.9) * 100) / 100,
          salaryValue: Math.round(rngRange(rng, 0.3, 0.8) * 100) / 100,
          demandGrowth: Math.round(rngRange(rng, 0.1, 0.5) * 100) / 100,
          monthsToLearn: 0,
        });
      }
    }
  }

  await createManyChunked("career transitions", transitionRows, (c) => prisma.careerTransition.createMany({ data: c as never }));
  await createManyChunked("transition skill gaps", skillGapRows, (c) => prisma.transitionSkillGap.createMany({ data: c as never }));

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
