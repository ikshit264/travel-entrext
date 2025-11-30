import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createJournalSchema } from "@/utils/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const validated = createJournalSchema.parse(body);

    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        tripId: validated.tripId,
        dayPlanId: validated.dayPlanId || null,
        content: validated.content,
      },
    });

    return NextResponse.json({ entry: journalEntry });
  } catch (error: any) {
    console.error("Journal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create journal entry" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        tripId,
        userId: user.id,
      },
      include: {
        dayPlan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ entries: journalEntries });
  } catch (error: any) {
    console.error("Journal fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}
