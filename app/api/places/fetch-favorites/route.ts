import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlacesByRadius } from "@/lib/opentripmap";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { tripId, latitude, longitude } = body;

    if (!tripId || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields: tripId, latitude, longitude" },
        { status: 400 }
      );
    }

    // verify trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Fetch categories in parallel
    // Categories: https://opentripmap.io/catalog
    const radius = 5000; // 5km

    const [attractions, restaurants, cafes, nature, museums] = await Promise.all([
      getPlacesByRadius(latitude, longitude, radius, "interesting_places,architecture,historic", 10),
      getPlacesByRadius(latitude, longitude, radius, "restaurants", 10),
      getPlacesByRadius(latitude, longitude, radius, "cafes", 10),
      getPlacesByRadius(latitude, longitude, radius, "natural", 10),
      getPlacesByRadius(latitude, longitude, radius, "museums", 10),
    ]);

    const famousPlacesData = {
      attractions,
      restaurants,
      cafes,
      nature,
      museums,
      lastUpdated: new Date().toISOString(),
    };

    // Update Trip with fetched data
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        famousPlaces: famousPlacesData as any,
      },
    });

    return NextResponse.json({ success: true, data: famousPlacesData });
  } catch (error: any) {
    console.error("Fetch favorites error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch places" },
      { status: 500 }
    );
  }
}
