import { UAParser } from "ua-parser-js";
import { DeviceType } from "@prisma/client";
import type { TrafficProfile } from "./types";

const FACEBOOK_INAPP_PATTERNS = [
  /\bFBAN\b/i,
  /\bFBAV\b/i,
  /\bFBIOS\b/i,
  /\bFB_IAB\b/i,
  /\bFB4A\b/i,
  /\bFBBV\b/i,
  /\bFBDV\b/i,
];

function mapDeviceType(type: string | undefined, userAgent: string): DeviceType {
  switch (type?.toLowerCase()) {
    case "mobile":
      return DeviceType.MOBILE;
    case "tablet":
      return DeviceType.TABLET;
    case "desktop":
    case "wearable":
    case "smarttv":
      return DeviceType.DESKTOP;
    default:
      if (/mobile|iphone|android/i.test(userAgent) && !/ipad|tablet/i.test(userAgent)) {
        return DeviceType.MOBILE;
      }
      if (/ipad|tablet/i.test(userAgent)) {
        return DeviceType.TABLET;
      }
      return DeviceType.DESKTOP;
  }
}

export function isFacebookInAppBrowser(userAgent: string, referrer: string): boolean {
  const uaMatch = FACEBOOK_INAPP_PATTERNS.some((pattern) => pattern.test(userAgent));
  const referrerMatch = /facebook\.com|fb\.com|fb\.me/i.test(referrer);
  return uaMatch || (referrerMatch && /mobile/i.test(userAgent));
}

export function classifyTraffic(input: {
  userAgent?: string | null;
  referrer?: string | null;
  acceptLanguage?: string | null;
  country?: string | null;
  ipAddress?: string | null;
}): TrafficProfile {
  const userAgent = input.userAgent ?? "";
  const referrer = input.referrer ?? "";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const deviceType = mapDeviceType(result.device.type, userAgent);
  const language = (input.acceptLanguage ?? "en").split(",")[0]?.trim() || "en";

  return {
    userAgent,
    deviceType,
    browser: result.browser.name ?? "Unknown",
    os: result.os.name ?? "Unknown",
    referrer,
    country: input.country ?? "Unknown",
    language,
    isFacebookInApp: isFacebookInAppBrowser(userAgent, referrer),
    isMobile: deviceType === DeviceType.MOBILE || deviceType === DeviceType.TABLET,
    ipAddress: input.ipAddress ?? "unknown",
  };
}

export async function resolveCountry(ipAddress: string): Promise<string> {
  if (!ipAddress || ipAddress === "unknown" || isPrivateIp(ipAddress)) {
    return "Local";
  }

  const apiUrl = process.env.GEOIP_API_URL ?? "http://ip-api.com/json";
  try {
    const response = await fetch(`${apiUrl}/${ipAddress}?fields=countryCode,status`, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    });

    if (!response.ok) return "Unknown";

    const data = (await response.json()) as { status?: string; countryCode?: string };
    if (data.status === "success" && data.countryCode) {
      return data.countryCode;
    }
  } catch {
    // Geolocation is best-effort; routing still works without it.
  }

  return "Unknown";
}

function isPrivateIp(ip: string): boolean {
  return (
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip === "::1" ||
    ip.startsWith("fe80:")
  );
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headers.get("x-real-ip") ?? "unknown";
}
