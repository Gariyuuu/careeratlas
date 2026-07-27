"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function upsertProfile(_prevState: ProfileFormState | undefined, formData: FormData): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not_signed_in" };

  const num = (key: string) => {
    const v = formData.get(key);
    return v ? Number(v) : undefined;
  };
  const str = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      educationStatus: str("educationStatus"),
      currentIndustry: str("currentIndustry"),
      currentRoleSlug: str("currentRoleSlug"),
      location: str("location"),
      expectedGraduationYear: num("expectedGraduationYear"),
      skillsCsv: str("skillsCsv"),
      salaryGoal: num("salaryGoal"),
      workArrangementPref: str("workArrangementPref"),
      currentSalary: num("currentSalary"),
      yearsExperience: num("yearsExperience"),
      degreeLevel: str("degreeLevel"),
      major: str("major"),
      companySize: str("companySize"),
      onboardedAt: new Date(),
    },
    update: {
      educationStatus: str("educationStatus"),
      currentIndustry: str("currentIndustry"),
      currentRoleSlug: str("currentRoleSlug"),
      location: str("location"),
      expectedGraduationYear: num("expectedGraduationYear"),
      skillsCsv: str("skillsCsv"),
      salaryGoal: num("salaryGoal"),
      workArrangementPref: str("workArrangementPref"),
      currentSalary: num("currentSalary"),
      yearsExperience: num("yearsExperience"),
      degreeLevel: str("degreeLevel"),
      major: str("major"),
      companySize: str("companySize"),
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
