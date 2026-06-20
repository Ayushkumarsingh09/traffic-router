import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import {
  classifyTraffic,
  getClientIp,
  resolveCountry,
} from "./traffic-classifier";
import { resolveRoute } from "./routing-engine";
import type { RouteResult, TrafficProfile } from "./types";

const VISITOR_COOKIE = "tr_visitor";

export async function processIncomingTraffic(request: Request): Promise<{
  profile: TrafficProfile;
  route: RouteResult;
  visitId: string;
  visitorId: string;
}> {
  const headers = request.headers;
  const ipAddress = getClientIp(headers);
  const country = await resolveCountry(ipAddress);

  const profile = classifyTraffic({
    userAgent: headers.get("user-agent"),
    referrer: headers.get("referer"),
    acceptLanguage: headers.get("accept-language"),
    country,
    ipAddress,
  });

  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = nanoid(16);
  }

  const rules = await prisma.routingRule.findMany({
    where: { isActive: true },
    include: {
      conditions: true,
      destination: true,
      pool: {
        include: {
          members: {
            include: { destination: true },
          },
        },
      },
    },
    orderBy: { priority: "asc" },
  });

  const fallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/landing/primary`;
  const route = resolveRoute(rules, profile, fallbackUrl);

  const visit = await prisma.visit.create({
    data: {
      visitorId,
      ipAddress,
      userAgent: profile.userAgent,
      referrer: profile.referrer || null,
      deviceType: profile.deviceType,
      browser: profile.browser,
      os: profile.os,
      country: profile.country,
      language: profile.language,
      isFacebookInApp: profile.isFacebookInApp,
      path: new URL(request.url).pathname,
    },
  });

  await prisma.routeDecision.create({
    data: {
      visitId: visit.id,
      ruleId: route.ruleId,
      ruleName: route.ruleName,
      poolId: route.poolId,
      poolName: route.poolName,
      destinationId: route.destinationId,
      destinationUrl: route.destinationUrl,
      action: route.action,
      reason: route.reason,
    },
  });

  return { profile, route, visitId: visit.id, visitorId };
}

export { VISITOR_COOKIE };
