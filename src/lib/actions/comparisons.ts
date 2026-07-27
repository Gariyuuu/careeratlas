"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function saveComparison(slugs: string[]): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not_signed_in" };
  if (slugs.length === 0) return { error: "empty" };

  const shareSlug = `cmp-${Math.random().toString(36).slice(2, 9)}`;
  await prisma.savedComparison.create({
    data: { userId: session.user.id, slug: shareSlug, occupationIds: JSON.stringify(slugs) },
  });
  revalidatePath("/saved");
  return { ok: true };
}

export async function deleteSavedComparison(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.savedComparison.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/saved");
}
