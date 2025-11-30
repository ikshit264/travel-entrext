import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateSegment } from "@/lib/ai/adaptive-engine";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { tripId, dayPlanId, message } = body;

    if (!tripId || !dayPlanId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify Trip Ownership & Fetch Context
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: user.id },
      include: { 
        itineraries: { 
          include: { 
            dayPlans: {
              orderBy: { dayIndex: 'asc' }
            } 
          } 
        } 
      }
    });

    if (!trip || !trip.itineraries[0]) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
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

    const itinerary = trip.itineraries[0];
    const dayPlans = itinerary.dayPlans;
    const currentDayIndex = dayPlans.findIndex(d => d.id === dayPlanId);

    if (currentDayIndex === -1) {
      return NextResponse.json({ error: "Day plan not found" }, { status: 404 });
    }

    const currentDay = dayPlans[currentDayIndex];
    const previousDay = currentDayIndex > 0 ? dayPlans[currentDayIndex - 1] : null;
    const nextDay = currentDayIndex < dayPlans.length - 1 ? dayPlans[currentDayIndex + 1] : null;

    // Fetch Weather Forecast
    const { getForecast } = await import("@/lib/weather");
    let weatherContext = "Not available";
    try {
      const forecast = await getForecast(trip.destinationCity);
      // Filter forecast for the specific day
      const targetDate = new Date(currentDay.date).toISOString().split('T')[0];
      const dayForecast = forecast.filter(f => {
        const fDate = new Date(f.dt * 1000).toISOString().split('T')[0];
        return fDate === targetDate;
      });

      if (dayForecast.length > 0) {
        weatherContext = dayForecast.map(f => 
          `- ${new Date(f.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: ${f.temperature}°C, ${f.description}`
        ).join("\n");
      } else if (forecast.length > 0) {
        // Fallback: Map available forecast to the trip day index
        const uniqueDays = Array.from(new Set(forecast.map(f => new Date(f.dt * 1000).toISOString().split('T')[0])));
        // Use modulo to cycle through available days if trip is longer than forecast
        const targetDayIndex = (currentDayIndex) % uniqueDays.length; 
        const fallbackDate = uniqueDays[targetDayIndex];
        
        const fallbackForecast = forecast.filter(f => 
            new Date(f.dt * 1000).toISOString().split('T')[0] === fallbackDate
        );

        weatherContext = `(Projected from current weather) \n` + fallbackForecast.map(f => 
          `- ${new Date(f.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: ${f.temperature}°C, ${f.description}`
        ).join("\n");
      } else {
        weatherContext = "Detailed forecast not available. Assume typical seasonal weather.";
      }
    } catch (e) {
      console.error("Failed to fetch forecast for chat:", e);
    }

    // 2. Execute Change with Context (DRY RUN)
    const updatedPlan = await regenerateSegment({
      apiKey,
      tripId,
      dayPlanId,
      type: "MOOD", // Using MOOD type for user-requested changes
      data: { 
        inferredEmotion: "user_request", 
        metrics: { 
          request: message,
          weather: weatherContext, // Inject formatted weather string
          context: {
            previousDaySummary: previousDay ? JSON.stringify(previousDay.activities) : "None",
            nextDaySummary: nextDay ? JSON.stringify(nextDay.activities) : "None",
            currentDaySummary: JSON.stringify(currentDay.activities)
          }
        } 
      },
      save: false // Don't save yet, let user review
    });

    return NextResponse.json({ 
      success: true, 
      updatedPlan
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
