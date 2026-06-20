import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, validateCsrf } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { parseBody, ruleSchema } from "@/lib/validation";
import { getClientIp } from "@/lib/traffic-classifier";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const rule = await prisma.routingRule.findUnique({
      where: { id },
      include: { conditions: true, destination: true, pool: true },
    });
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await validateCsrf(request);
    const { id } = await params;
    const body = parseBody(ruleSchema, await request.json());

    await prisma.ruleCondition.deleteMany({ where: { ruleId: id } });
    const rule = await prisma.routingRule.update({
      where: { id },
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
      include: { conditions: true, destination: true, pool: true },
    });

    await writeAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entityType: "RoutingRule",
      entityId: id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: "Failed to update rule" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await validateCsrf(request);
    const { id } = await params;
    await prisma.routingRule.delete({ where: { id } });
    await writeAuditLog({
      userId: session.userId,
      action: "DELETE",
      entityType: "RoutingRule",
      entityId: id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 400 });
  }
}
