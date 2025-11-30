import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateItinerary } from "@/lib/ai/gemini";
import { generateItinerarySchema } from "@/utils/validators";
import { calculateDaysBetween } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const validated = generateItinerarySchema.parse(body);

    const trip = await prisma.trip.findFirst({
      where: {
        id: validated.tripId,
        userId: user.id,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
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

    const habitPattern = await prisma.habitPattern.findUnique({
      where: { userId: user.id },
    });

    // Fetch famous places
    // Priority: 1. Stored OpenTripMap data (JSON), 2. Legacy text fetch
    let placesContext: any = trip.famousPlaces;
    
    if (!placesContext) {
        const { getFamousPlaces, formatPlacesForPrompt } = await import("@/lib/places");
        const places = await getFamousPlaces(trip.destinationCity);
        placesContext = formatPlacesForPrompt(places);
    }

    // Fetch weather forecast
    const { getForecast, getForecastByCoordinates } = await import("@/lib/weather");
    let weatherForecast = "";
    try {
      let forecastData;
      if (trip.latitude && trip.longitude) {
        forecastData = await getForecastByCoordinates(trip.latitude, trip.longitude);
      } else {
        forecastData = await getForecast(trip.destinationCity);
      }
      
      weatherForecast = forecastData.map(f => 
        `- ${new Date(f.dt * 1000).toLocaleString()}: ${f.temperature}°C, ${f.description}`
      ).join("\n");
    } catch (e) {
      console.error("Failed to fetch weather for prompt:", e);
    }

    const aiResponse = await generateItinerary(apiKey, {
      destination: trip.destinationCity,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      currency: trip.currency,
      preferences: trip.preferences as any,
      habitPatterns: habitPattern ? {
        learnedWakeTimeDistribution: habitPattern.learnedWakeTimeDistribution,
        walkingToleranceStats: habitPattern.walkingToleranceStats,
        cuisinePreferences: habitPattern.cuisinePreferences,
        budgetBehavior: habitPattern.budgetBehavior,
      } : undefined,
      famousPlaces: placesContext,
      weatherForecast,
    });

    const totalDays = calculateDaysBetween(trip.startDate, trip.endDate);

    const itinerary = await prisma.itinerary.create({
      data: {
        tripId: trip.id,
        rawAIResponse: aiResponse,
        summary: aiResponse.summary || "Your personalized itinerary",
        totalDays,
      },
    });

    const dayPlans = await Promise.all(
      aiResponse.days.map((day: any) =>
        prisma.dayPlan.create({
          data: {
            itineraryId: itinerary.id,
            date: new Date(day.date),
            dayIndex: day.dayIndex,
            activities: day.activities,
            routeInfo: day.dailyTravelCost ? { cost: day.dailyTravelCost } : null,
            moodAdjustments: null,
          },
        })
      )
    );

    return NextResponse.json({
      itinerary: {
        ...itinerary,
        dayPlans,
      },
    });
  } catch (error: any) {
    console.error("Itinerary generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate itinerary" },
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

    const itineraries = await prisma.itinerary.findMany({
      where: {
        trip: {
          id: tripId,
          userId: user.id,
        },
      },
      include: {
        dayPlans: {
          orderBy: {
            dayIndex: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ itineraries });
  } catch (error: any) {
    console.error("Itinerary fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch itineraries" },
      { status: 500 }
    );
  }
}
