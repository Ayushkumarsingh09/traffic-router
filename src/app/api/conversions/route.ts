import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, conversionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = parseBody(conversionSchema, await request.json());
    const conversion = await prisma.conversion.create({
      data: {
        visitId: body.visitId,
        destinationId: body.destinationId,
        eventName: body.eventName ?? "conversion",
        value: body.value,
        metadata: body.metadata as Record<string, string | number | boolean | null> | undefined,
      },
    });
    return NextResponse.json(conversion, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record conversion" }, { status: 400 });
  }
}
