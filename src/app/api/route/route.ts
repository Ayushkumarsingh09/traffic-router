import { NextResponse } from "next/server";
import { processIncomingTraffic, VISITOR_COOKIE } from "@/lib/traffic-service";

export async function GET(request: Request) {
  try {
    const { route, visitorId } = await processIncomingTraffic(request);

    const response =
      route.action === "REDIRECT"
        ? NextResponse.redirect(route.destinationUrl, { status: 302 })
        : NextResponse.redirect(route.destinationUrl, { status: 307 });

    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    response.headers.set("X-Route-Decision", route.reason.replace(/[^\x20-\x7E]/g, ""));
    return response;
  } catch (error) {
    console.error("Route processing failed:", error);
    return NextResponse.redirect(new URL("/landing/primary", request.url));
  }
}
