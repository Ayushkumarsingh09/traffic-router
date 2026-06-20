import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isRouteApi = pathname.startsWith("/api/route");
  const isAdminApi = pathname.startsWith("/api/") && !isAuthRoute && !isRouteApi;

  if (pathname.startsWith("/api/")) {
    const limitType = isAuthRoute ? "auth" : isRouteApi ? "route" : "api";
    const { allowed, retryAfter } = await checkRateLimit(`${ip}:${limitType}`, limitType);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter ?? 60) },
        },
      );
    }
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("tr_session");
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (isAdminApi) {
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
