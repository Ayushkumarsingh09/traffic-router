import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAnalyticsSummary, getRecentTrafficLogs } from "@/lib/analytics";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") ?? "30");
    const limit = Number(searchParams.get("limit") ?? "50");

    const [summary, logs] = await Promise.all([
      getAnalyticsSummary(days),
      getRecentTrafficLogs(limit),
    ]);

    return NextResponse.json({ summary, logs });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
