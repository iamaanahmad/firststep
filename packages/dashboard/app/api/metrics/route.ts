import { NextRequest, NextResponse } from "next/server";
import { aggregateMetrics, getEvents } from "@/lib/event-store";

export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    const events = await getEvents();
    const metrics = aggregateMetrics(events);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
