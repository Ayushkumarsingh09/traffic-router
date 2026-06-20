import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, validateCsrf } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { destinationSchema, parseBody } from "@/lib/validation";
import { getClientIp } from "@/lib/traffic-classifier";

export async function GET() {
  try {
    await requireAdmin();
    const destinations = await prisma.destination.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(destinations);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await validateCsrf(request);
    const body = parseBody(destinationSchema, await request.json());
    const destination = await prisma.destination.create({ data: body });
    await writeAuditLog({
      userId: session.userId,
      action: "CREATE",
      entityType: "Destination",
      entityId: destination.id,
      ipAddress: getClientIp(request.headers),
    });
    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Invalid CSRF token") {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create destination" }, { status: 400 });
  }
}
