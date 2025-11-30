import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTripSchema } from "@/utils/validators";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");

    if (tripId) {
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          userId: user.id,
        },
        include: {
          itineraries: {
            include: {
              dayPlans: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          expenses: true,
          weatherEvents: true,
          journalEntries: true,
        },
      });

      if (!trip) {
        return NextResponse.json(
          { error: "Trip not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ trip });
    }

    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      include: {
        itineraries: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        expenses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ trips });
  } catch (error: any) {
    console.error("Trip fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    // Validate the request body
    const validated = createTripSchema.parse(body);

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: validated.title,
        destinationCity: validated.destinationCity,
        country: validated.country,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        budget: validated.budget,
        currency: validated.currency,
        travelMode: validated.travelMode,
        preferences: validated.preferences || {},
        // Geo-location data
        latitude: validated.latitude,
        longitude: validated.longitude,
        cityType: validated.cityType,
        population: validated.population,
        externalCityId: validated.externalCityId,
      },
    });

    return NextResponse.json({ trip });
  } catch (error: any) {
    console.error("Trip creation error:", error);
    
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: error.errors,
          message: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create trip" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    await prisma.trip.deleteMany({
      where: {
        id: tripId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Trip deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete trip" },
      { status: 500 }
    );
  }
}
