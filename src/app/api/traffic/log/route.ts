import { NextResponse } from "next/server";
import { processIncomingTraffic } from "@/lib/traffic-service";

export async function POST(request: Request) {
  try {
    const { profile, route, visitId } = await processIncomingTraffic(request);
    return NextResponse.json({ profile, route, visitId });
  } catch (error) {
    console.error("Traffic log failed:", error);
    return NextResponse.json({ error: "Failed to process traffic" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
