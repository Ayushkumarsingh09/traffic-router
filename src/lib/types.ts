import type { DeviceType } from "@prisma/client";

export interface TrafficProfile {
  userAgent: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  referrer: string;
  country: string;
  language: string;
  isFacebookInApp: boolean;
  isMobile: boolean;
  ipAddress: string;
}

export interface RouteResult {
  action: "SHOW" | "REDIRECT";
  destinationUrl: string;
  destinationId?: string;
  ruleId?: string;
  ruleName?: string;
  poolId?: string;
  poolName?: string;
  reason: string;
}

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  referrerBreakdown: Record<string, number>;
  routeBreakdown: Record<string, number>;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
