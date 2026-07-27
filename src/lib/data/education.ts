import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface EducationOutcomeFilters {
  majorSlug?: string;
  degreeLevel?: string;
}

export async function listMajors() {
  return prisma.major.findMany({ orderBy: { name: "asc" } });
}

export async function listInstitutions() {
  return prisma.institution.findMany({ orderBy: { name: "asc" }, include: { costs: true } });
}

export async function listEducationOutcomes(filters: EducationOutcomeFilters) {
  const where: Prisma.EducationOutcomeWhereInput = {};
  if (filters.majorSlug) where.major = { slug: filters.majorSlug };
  if (filters.degreeLevel) where.degreeLevel = filters.degreeLevel;

  return prisma.educationOutcome.findMany({
    where,
    include: { major: true },
    orderBy: { entrySalaryMedian: "desc" },
  });
}

export async function getEducationOutcomeById(id: string) {
  return prisma.educationOutcome.findUnique({ where: { id }, include: { major: true, educationProgram: { include: { institution: true } } } });
}

export async function listAllEducationOutcomesForCompare() {
  return prisma.educationOutcome.findMany({
    include: { major: true },
    orderBy: [{ major: { name: "asc" } }, { degreeLevel: "asc" }],
  });
}
