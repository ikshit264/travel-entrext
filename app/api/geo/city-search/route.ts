import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");

  if (!city || !country) {
    return NextResponse.json(
      { error: "City and Country are required" },
      { status: 400 }
    );
  }

  try {
    // Nominatim API (OpenStreetMap)
    // https://nominatim.org/release-docs/develop/api/Search/
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
      city
    )}&country=${encodeURIComponent(
      country
    )}&format=json&addressdetails=1&limit=10&featuretype=city`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TravelPlannerApp/1.0", // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from Nominatim");
    }

    const data = await response.json();

    // Transform to standardized format
    const results = data.map((item: any) => ({
      name: item.name,
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      cityType: item.type, // city, town, village, etc.
      population: item.extratags?.population ? parseInt(item.extratags.population) : undefined,
      externalId: `osm:${item.osm_id}`,
      state: item.address?.state,
      region: item.address?.region,
    }));

    // Sort by importance (population proxy) if available, or just return as is
    // Nominatim usually sorts by importance by default

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("City search error:", error);
    return NextResponse.json(
      { error: "Failed to search cities" },
      { status: 500 }
    );
  }
}
