import { describe, expect, it } from "vitest";
import { resolveRoute } from "@/lib/routing-engine";
import { classifyTraffic } from "@/lib/traffic-classifier";
import { DeviceType } from "@prisma/client";

describe("integration: traffic classification + routing", () => {
  it("routes non-Facebook traffic through weighted pool rule", () => {
    const profile = classifyTraffic({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      referrer: "https://www.google.com",
      acceptLanguage: "en-US",
      country: "US",
    });

    const route = resolveRoute(
      [
        {
          id: "fb-rule",
          name: "Facebook In-App",
          priority: 10,
          isActive: true,
          action: "SHOW",
          destination: {
            id: "primary",
            url: "http://localhost:3000/landing/primary",
            type: "INTERNAL",
            isActive: true,
          },
          pool: null,
          conditions: [{ field: "IS_FACEBOOK_INAPP", operator: "EQUALS", value: "true" }],
        },
        {
          id: "pool-rule",
          name: "Random Pool",
          priority: 100,
          isActive: true,
          action: "REDIRECT",
          destination: null,
          pool: {
            id: "pool-1",
            name: "Random Redirect Pool",
            members: [
              {
                weight: 50,
                destination: {
                  id: "spotify",
                  url: "https://open.spotify.com",
                  type: "EXTERNAL",
                  isActive: true,
                },
              },
              {
                weight: 50,
                destination: {
                  id: "google",
                  url: "https://www.google.com",
                  type: "EXTERNAL",
                  isActive: true,
                },
              },
            ],
          },
          conditions: [{ field: "LANGUAGE", operator: "CONTAINS", value: "" }],
        },
      ] as never,
      profile,
      "http://localhost:3000/landing/primary",
    );

    expect(profile.isFacebookInApp).toBe(false);
    expect(profile.deviceType).toBe(DeviceType.DESKTOP);
    expect(route.action).toBe("REDIRECT");
    expect(["https://open.spotify.com", "https://www.google.com"]).toContain(route.destinationUrl);
  });
});
