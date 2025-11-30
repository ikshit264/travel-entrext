import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dayPlanId: string }> }
) {
  try {
    const user = await requireAuth();
    const { dayPlanId } = await params;
    const body = await request.json();
    const { activities } = body;

    if (!activities) {
      return NextResponse.json({ error: "Missing activities" }, { status: 400 });
    }

    // Verify ownership via Trip -> Itinerary -> DayPlan
    const dayPlan = await prisma.dayPlan.findUnique({
      where: { id: dayPlanId },
      include: { itinerary: { include: { trip: true } } }
    });

    if (!dayPlan || dayPlan.itinerary.trip.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updatedDayPlan = await prisma.dayPlan.update({
      where: { id: dayPlanId },
      data: { activities },
    });

    return NextResponse.json({ success: true, dayPlan: updatedDayPlan });

  } catch (error: any) {
    console.error("Update Day Plan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
