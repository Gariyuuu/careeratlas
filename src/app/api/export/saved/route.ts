import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });

  const saved = await prisma.savedOccupation.findMany({
    where: { userId: session.user.id },
    include: { occupation: { include: { jobFamily: { include: { subindustry: { include: { industry: true } } } } } } },
    orderBy: { createdAt: "desc" },
  });

  const header = ["title", "industry", "job_family", "saved_at", "note"];
  const lines = [header.join(",")];
  for (const s of saved) {
    lines.push(
      [
        s.occupation.title,
        s.occupation.jobFamily.subindustry.industry.name,
        s.occupation.jobFamily.name,
        s.createdAt.toISOString(),
        s.note ?? "",
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=careeratlas-saved-careers.csv",
    },
  });
}
