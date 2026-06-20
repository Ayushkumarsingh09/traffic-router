import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, validateCsrf } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { parseBody, poolSchema } from "@/lib/validation";
import { getClientIp } from "@/lib/traffic-classifier";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const pool = await prisma.destinationPool.findUnique({
      where: { id },
      include: { members: { include: { destination: true } } },
    });
    if (!pool) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(pool);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await validateCsrf(request);
    const { id } = await params;
    const body = parseBody(poolSchema, await request.json());

    await prisma.poolMember.deleteMany({ where: { poolId: id } });
    const pool = await prisma.destinationPool.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? true,
        members: {
          create: body.members.map((member) => ({
            destinationId: member.destinationId,
            weight: member.weight,
          })),
        },
      },
      include: { members: { include: { destination: true } } },
    });

    await writeAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entityType: "DestinationPool",
      entityId: id,
      ipAddress: getClientIp(request.headers),
    });

    return NextResponse.json(pool);
  } catch {
    return NextResponse.json({ error: "Failed to update pool" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await validateCsrf(request);
    const { id } = await params;
    await prisma.destinationPool.delete({ where: { id } });
    await writeAuditLog({
      userId: session.userId,
      action: "DELETE",
      entityType: "DestinationPool",
      entityId: id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete pool" }, { status: 400 });
  }
}
