import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, validateCsrf } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";
import { getClientIp } from "@/lib/traffic-classifier";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const siteConfigSchema = z.object({
  landingTitle: z.string().min(1).max(200),
  landingCtaUrl: z.string().url(),
  landingImages: z.array(z.string().url()).min(1),
  ogTitle: z.string().min(1).max(500),
  ogDescription: z.string().min(1).max(500),
  ogImage: z.string().url(),
  ogUrl: z.string().url(),
  desktopRedirectUrl: z.string().url(),
  desktopBreakpoint: z.number().int().min(320).max(3840),
  delayedRedirectMs: z.number().int().min(0).max(60000),
  enableDesktopRedirect: z.boolean(),
  enableDelayedRedirect: z.boolean(),
});

export async function GET() {
  try {
    await requireAdmin();
    const config = await getSiteConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await validateCsrf(request);
    const body = siteConfigSchema.parse(await request.json());

    const config = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: {
        ...body,
        landingImages: body.landingImages,
      },
      create: {
        id: "default",
        ...body,
        landingImages: body.landingImages,
      },
    });

    await writeAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entityType: "SiteConfig",
      entityId: config.id,
      ipAddress: getClientIp(request.headers),
    });

    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to update site config" }, { status: 400 });
  }
}
