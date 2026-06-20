import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "./prisma";

const SESSION_COOKIE = "tr_session";
const CSRF_COOKIE = "tr_csrf";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const token = jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: "24h" });
  const csrfToken = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      csrfToken,
      expiresAt,
      ipAddress,
      userAgent,
    },
    include: { user: true },
  });

  return session;
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function setSessionCookies(token: string, csrfToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(CSRF_COOKIE);
}

export async function requireAdmin() {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function validateCsrf(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const csrfHeader = request.headers.get("x-csrf-token");
  if (!csrfHeader || csrfHeader !== session.csrfToken) {
    throw new Error("Invalid CSRF token");
  }

  return session;
}

export { SESSION_COOKIE, CSRF_COOKIE };
