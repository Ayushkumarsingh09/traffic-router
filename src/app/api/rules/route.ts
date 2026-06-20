import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, validateCsrf } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { parseBody, ruleSchema } from "@/lib/validation";
import { getClientIp } from "@/lib/traffic-classifier";

export async function GET() {
  try {
    await requireAdmin();
    const rules = await prisma.routingRule.findMany({
      include: {
        conditions: true,
        destination: true,
        pool: true,
      },
      orderBy: { priority: "asc" },
    });
    return NextResponse.json(rules);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await validateCsrf(request);
    const body = parseBody(ruleSchema, await request.json());
    const rule = await prisma.routingRule.create({
      data: {
        name: body.name,
        description: body.description,
        priority: body.priority ?? 100,
        isActive: body.isActive ?? true,
        action: body.action ?? "REDIRECT",
        destinationId: body.destinationId,
        poolId: body.poolId,
        conditions: {
          create: body.conditions,
        },
      },
      include: {
        conditions: true,
        destination: true,
        pool: true,
      },
    });
    await writeAuditLog({
      userId: session.userId,
      action: "CREATE",
      entityType: "RoutingRule",
      entityId: rule.id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json(rule, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create rule" }, { status: 400 });
  }
}
