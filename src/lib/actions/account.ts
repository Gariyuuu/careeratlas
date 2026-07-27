"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "not_signed_in" };

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/" });
}
