import { prisma } from "./prisma";
import type { AnalyticsSummary } from "./types";

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [visits, uniqueVisitors, conversions, routeDecisions] = await Promise.all([
    prisma.visit.count({ where: { createdAt: { gte: since } } }),
    prisma.visit.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: since } },
    }),
    prisma.conversion.count({ where: { createdAt: { gte: since } } }),
    prisma.routeDecision.findMany({
      where: { createdAt: { gte: since } },
      select: { ruleName: true, poolName: true, destinationUrl: true },
    }),
  ]);

  const visitRows = await prisma.visit.findMany({
    where: { createdAt: { gte: since } },
    select: {
      deviceType: true,
      country: true,
      referrer: true,
    },
  });

  const deviceBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};
  const referrerBreakdown: Record<string, number> = {};
  const routeBreakdown: Record<string, number> = {};

  for (const row of visitRows) {
    deviceBreakdown[row.deviceType] = (deviceBreakdown[row.deviceType] ?? 0) + 1;
    const country = row.country ?? "Unknown";
    countryBreakdown[country] = (countryBreakdown[country] ?? 0) + 1;
    const referrer = row.referrer
      ? (() => {
          try {
            return new URL(row.referrer).hostname;
          } catch {
            return row.referrer;
          }
        })()
      : "Direct";
    referrerBreakdown[referrer] = (referrerBreakdown[referrer] ?? 0) + 1;
  }

  for (const decision of routeDecisions) {
    const label = decision.ruleName ?? decision.poolName ?? decision.destinationUrl;
    routeBreakdown[label] = (routeBreakdown[label] ?? 0) + 1;
  }

  const uniqueCount = uniqueVisitors.length;
  const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

  return {
    totalVisits: visits,
    uniqueVisitors: uniqueCount,
    conversions,
    conversionRate: Number(conversionRate.toFixed(2)),
    deviceBreakdown,
    countryBreakdown,
    referrerBreakdown,
    routeBreakdown,
  };
}

export async function getRecentTrafficLogs(limit = 50) {
  return prisma.visit.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      routeDecision: true,
      conversions: true,
    },
  });
}
