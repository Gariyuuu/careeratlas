"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleSavedOccupation(occupationSlug: string): Promise<{ saved: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not_signed_in" };

  const occupation = await prisma.occupation.findUnique({ where: { slug: occupationSlug }, select: { id: true } });
  if (!occupation) return { error: "not_found" };

  const existing = await prisma.savedOccupation.findUnique({
    where: { userId_occupationId: { userId: session.user.id, occupationId: occupation.id } },
  });

  if (existing) {
    await prisma.savedOccupation.delete({ where: { id: existing.id } });
    revalidatePath("/saved");
    revalidatePath(`/roles/${occupationSlug}`);
    return { saved: false };
  }

  await prisma.savedOccupation.create({ data: { userId: session.user.id, occupationId: occupation.id } });
  revalidatePath("/saved");
  revalidatePath(`/roles/${occupationSlug}`);
  return { saved: true };
}

export async function isOccupationSaved(occupationSlug: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const occupation = await prisma.occupation.findUnique({ where: { slug: occupationSlug }, select: { id: true } });
  if (!occupation) return false;
  const existing = await prisma.savedOccupation.findUnique({
    where: { userId_occupationId: { userId: session.user.id, occupationId: occupation.id } },
  });
  return !!existing;
}
