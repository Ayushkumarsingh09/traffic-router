import { NextResponse } from "next/server";
import {
  clearSessionCookies,
  createSession,
  setSessionCookies,
  verifyPassword,
} from "@/lib/auth";
import { getClientIp } from "@/lib/traffic-classifier";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { loginSchema, parseBody } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = parseBody(loginSchema, await request.json());
    const user = await prisma.adminUser.findUnique({ where: { email: body.email } });

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ipAddress = getClientIp(request.headers);
    const session = await createSession(user.id, ipAddress, request.headers.get("user-agent") ?? undefined);
    await setSessionCookies(session.token, session.csrfToken);
    await writeAuditLog({
      userId: user.id,
      action: "LOGIN",
      entityType: "AdminUser",
      entityId: user.id,
      ipAddress,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      csrfToken: session.csrfToken,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await import("@/lib/auth").then((m) => m.getSessionFromCookies());
  if (session) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    await writeAuditLog({
      userId: session.userId,
      action: "LOGOUT",
      entityType: "Session",
      entityId: session.id,
    });
  }
  await clearSessionCookies();
  return NextResponse.json({ success: true });
}
