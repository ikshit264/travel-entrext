import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeather } from "@/lib/weather";
import { regenerateSegment } from "@/lib/ai/adaptive-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, dayPlanId, city, date } = body;

    if (!tripId || !dayPlanId || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get Real Weather
    const weather = await getWeather(city);

    if (!weather) {
      return NextResponse.json({ error: "Weather data unavailable" }, { status: 503 });
    }

    // 2. Log Weather Event
    const weatherEvent = await prisma.weatherEvent.create({
      data: {
        tripId,
        dayPlanId,
        datetime: new Date(date || new Date()),
        location: { name: city },
        weatherType: weather.condition,
        temperature: weather.temperature,
        severity: weather.isSevere ? (weather.riskType === "EXTREME" ? "high" : "medium") : "low",
      },
    });

    // 3. Check for Regeneration Trigger
    let updatedPlan = null;
    if (weather.isSevere) {
      console.log(`Severe weather detected (${weather.riskType}). Regenerating...`);
      
      // Fetch trip owner's encrypted API key
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true },
      });

      if (trip) {
        const userWithKey = await prisma.user.findUnique({
          where: { id: trip.userId },
          select: { encryptedGeminiKey: true },
        });

        if (userWithKey?.encryptedGeminiKey) {
          // Decrypt the API key
          const { decryptApiKey } = await import("@/lib/crypto");
          const apiKey = decryptApiKey(userWithKey.encryptedGeminiKey);

          updatedPlan = await regenerateSegment({
            apiKey,
            tripId,
            dayPlanId,
            type: "WEATHER",
            data: weather,
          });
        }
      }
      
      // Update the event to link the adjustments
      await prisma.weatherEvent.update({
        where: { id: weatherEvent.id },
        data: { aiAdjustments: updatedPlan }
      });
    }

    return NextResponse.json({ 
      weather, 
      regenerated: !!updatedPlan,
      updatedPlan 
    });

  } catch (error: any) {
    console.error("Weather API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
