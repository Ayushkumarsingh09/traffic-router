import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, validateCsrf } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { parseBody, poolSchema } from "@/lib/validation";
import { getClientIp } from "@/lib/traffic-classifier";

export async function GET() {
  try {
    await requireAdmin();
    const pools = await prisma.destinationPool.findMany({
      include: {
        members: { include: { destination: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pools);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await validateCsrf(request);
    const body = parseBody(poolSchema, await request.json());
    const pool = await prisma.destinationPool.create({
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
      include: {
        members: { include: { destination: true } },
      },
    });
    await writeAuditLog({
      userId: session.userId,
      action: "CREATE",
      entityType: "DestinationPool",
      entityId: pool.id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json(pool, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create pool" }, { status: 400 });
  }
}
