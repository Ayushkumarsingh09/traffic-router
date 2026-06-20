import { describe, expect, it } from "vitest";
import {
  classifyTraffic,
  isFacebookInAppBrowser,
} from "@/lib/traffic-classifier";
import {
  evaluateCondition,
  resolveRoute,
  selectWeightedDestination,
} from "@/lib/routing-engine";
import type { TrafficProfile } from "@/lib/types";
import { DeviceType } from "@prisma/client";

describe("traffic-classifier", () => {
  it("detects Facebook in-app browser from user agent", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.0.0;]";
    expect(isFacebookInAppBrowser(ua, "")).toBe(true);
  });

  it("classifies desktop Chrome traffic", () => {
    const profile = classifyTraffic({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      referrer: "https://google.com",
      acceptLanguage: "en-US,en;q=0.9",
      country: "US",
    });

    expect(profile.deviceType).toBe(DeviceType.DESKTOP);
    expect(profile.browser).toBe("Chrome");
    expect(profile.isFacebookInApp).toBe(false);
  });
});

describe("routing-engine", () => {
  const baseProfile: TrafficProfile = {
    userAgent: "Mozilla/5.0",
    deviceType: DeviceType.DESKTOP,
    browser: "Chrome",
    os: "Windows",
    referrer: "",
    country: "US",
    language: "en",
    isFacebookInApp: false,
    isMobile: false,
    ipAddress: "1.2.3.4",
  };

  it("evaluates EQUALS conditions", () => {
    expect(
      evaluateCondition(
        { field: "DEVICE_TYPE", operator: "EQUALS", value: "DESKTOP" } as never,
        baseProfile,
      ),
    ).toBe(true);
  });

  it("selects a weighted destination", () => {
    const destination = selectWeightedDestination([
      {
        weight: 100,
        destination: {
          id: "1",
          name: "A",
          url: "https://a.com",
          type: "EXTERNAL",
          isActive: true,
        },
      } as never,
    ]);

    expect(destination?.url).toBe("https://a.com");
  });

  it("routes Facebook in-app users to configured destination", () => {
    const result = resolveRoute(
      [
        {
          id: "rule-1",
          name: "FB Landing",
          priority: 10,
          isActive: true,
          action: "SHOW",
          destinationId: "dest-1",
          poolId: null,
          conditions: [{ field: "IS_FACEBOOK_INAPP", operator: "EQUALS", value: "true" } as never],
          destination: {
            id: "dest-1",
            url: "http://localhost:3000/landing/primary",
            type: "INTERNAL",
            isActive: true,
          } as never,
          pool: null,
        } as never,
      ],
      { ...baseProfile, isFacebookInApp: true },
      "http://localhost:3000/landing/primary",
    );

    expect(result.action).toBe("SHOW");
    expect(result.destinationUrl).toContain("/landing/primary");
  });
});
