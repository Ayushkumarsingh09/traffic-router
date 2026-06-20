import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, validateCsrf } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { destinationSchema, parseBody } from "@/lib/validation";
import { getClientIp } from "@/lib/traffic-classifier";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const destination = await prisma.destination.findUnique({ where: { id } });
    if (!destination) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(destination);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await validateCsrf(request);
    const { id } = await params;
    const body = parseBody(destinationSchema, await request.json());
    const destination = await prisma.destination.update({ where: { id }, data: body });
    await writeAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entityType: "Destination",
      entityId: id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json(destination);
  } catch {
    return NextResponse.json({ error: "Failed to update destination" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await validateCsrf(request);
    const { id } = await params;
    await prisma.destination.delete({ where: { id } });
    await writeAuditLog({
      userId: session.userId,
      action: "DELETE",
      entityType: "Destination",
      entityId: id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete destination" }, { status: 400 });
  }
}
