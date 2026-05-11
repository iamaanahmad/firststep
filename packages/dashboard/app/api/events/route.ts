import { NextRequest, NextResponse } from "next/server";
import { appendEvents } from "@/lib/event-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { events?: unknown[] };
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Events must be an array" },
        { status: 400 }
      );
    }

    const storedCount = await appendEvents(events);

    if (storedCount === 0) {
      return NextResponse.json(
        { error: "No valid events were provided" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      count: storedCount,
    });
  } catch (error) {
    console.error("Error recording events:", error);
    return NextResponse.json(
      { error: "Failed to record events" },
      { status: 400 }
    );
  }
}
