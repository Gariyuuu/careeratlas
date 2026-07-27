import { NextRequest, NextResponse } from "next/server";
import { runAllConfiguredImports } from "@/lib/providers/run-import";

// Wire this up as a daily Vercel Cron job (see vercel.json) or a Supabase
// scheduled function. Protect it with CRON_SECRET in production so it can't
// be triggered by arbitrary requests.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const results = await runAllConfiguredImports();
  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
