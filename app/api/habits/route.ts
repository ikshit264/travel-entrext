import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { learnHabits } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const historicalTrips = await prisma.trip.findMany({
      where: { userId: user.id },
      include: {
        itineraries: {
          include: {
            dayPlans: true,
          },
        },
        expenses: true,
        moodEvents: true,
      },
    });

    if (historicalTrips.length === 0) {
      return NextResponse.json(
        { error: "No historical trips found" },
        { status: 400 }
      );
    }

    // Fetch user's encrypted API key
    const userWithKey = await prisma.user.findUnique({
      where: { id: user.id },
      select: { encryptedGeminiKey: true },
    });

    if (!userWithKey?.encryptedGeminiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please add your API key in profile settings." },
        { status: 400 }
      );
    }

    // Decrypt the API key
    const { decryptApiKey } = await import("@/lib/crypto");
    const apiKey = decryptApiKey(userWithKey.encryptedGeminiKey);

    const edits = await prisma.moodEvent.findMany({
      where: {
        userId: user.id,
        appliedChanges: { not: null },
      },
    });

    const habitData = await learnHabits(apiKey, {
      userId: user.id,
      historicalTrips,
      edits,
    });

    const habitPattern = await prisma.habitPattern.upsert({
      where: { userId: user.id },
      update: {
        learnedWakeTimeDistribution: habitData.learnedWakeTimeDistribution,
        walkingToleranceStats: habitData.walkingToleranceStats,
        cuisinePreferences: habitData.cuisinePreferences,
        budgetBehavior: habitData.budgetBehavior,
      },
      create: {
        userId: user.id,
        learnedWakeTimeDistribution: habitData.learnedWakeTimeDistribution,
        walkingToleranceStats: habitData.walkingToleranceStats,
        cuisinePreferences: habitData.cuisinePreferences,
        budgetBehavior: habitData.budgetBehavior,
      },
    });

    return NextResponse.json({
      habitPattern,
      recommendations: habitData.recommendations,
    });
  } catch (error: any) {
    console.error("Habit learning error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to learn habits" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    const habitPattern = await prisma.habitPattern.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ habitPattern });
  } catch (error: any) {
    console.error("Habit fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch habits" },
      { status: 500 }
    );
  }
}
