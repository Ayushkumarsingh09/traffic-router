import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") ?? "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [total, byEvent, byDestination] = await Promise.all([
      prisma.conversion.count({ where: { createdAt: { gte: since } } }),
      prisma.conversion.groupBy({
        by: ["eventName"],
        where: { createdAt: { gte: since } },
        _count: { eventName: true },
      }),
      prisma.conversion.findMany({
        where: { createdAt: { gte: since } },
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          visit: { select: { deviceType: true, country: true, referrer: true } },
          destination: { select: { name: true, url: true } },
        },
      }),
    ]);

    const visits = await prisma.visit.count({ where: { createdAt: { gte: since } } });

    return NextResponse.json({
      totalConversions: total,
      conversionRate: visits > 0 ? Number(((total / visits) * 100).toFixed(2)) : 0,
      byEvent: Object.fromEntries(byEvent.map((row) => [row.eventName, row._count.eventName])),
      recent: byDestination,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
