import { env } from "./env";

const BASE_URL = "https://api.opentripmap.com/0.1/en";

export interface Place {
  name: string;
  kinds: string; // comma separated categories
  rate: number; // popularity 1-7
  point: {
    lon: number;
    lat: number;
  };
  wikidata?: string;
}

export async function getFamousPlaces(city: string): Promise<Place[]> {
  if (!env.OPENTRIPMAP_API_KEY) {
    console.warn("OPENTRIPMAP_API_KEY not set. Returning empty list.");
    return [];
  }

  try {
    // 1. Geocoding to get lat/lon of the city
    const geoRes = await fetch(
      `${BASE_URL}/places/geoname?name=${encodeURIComponent(city)}&apikey=${env.OPENTRIPMAP_API_KEY}`
    );
    if (!geoRes.ok) throw new Error("Geocoding failed");
    const geoData = await geoRes.json();

    if (!geoData.lat || !geoData.lon) return [];

    // 2. Fetch places within 10km radius, sorted by rating
    // Categories: interesting_places, museums, tourist_facilities, natural
    const radius = 10000; // 10km
    const limit = 20;
    const kinds = "interesting_places,museums,tourist_facilities,natural";

    const placesRes = await fetch(
      `${BASE_URL}/places/radius?radius=${radius}&lon=${geoData.lon}&lat=${geoData.lat}&kinds=${kinds}&rate=3&limit=${limit}&format=json&apikey=${env.OPENTRIPMAP_API_KEY}`
    );

    if (!placesRes.ok) throw new Error("Places fetch failed");
    const placesData = await placesRes.json();

    return placesData;
  } catch (error) {
    console.error("Failed to fetch famous places:", error);
    return [];
  }
}

export function formatPlacesForPrompt(places: Place[]): string {
  if (!places.length) return "No specific famous places data available. Use general knowledge.";
  
  return places.map(p => 
    `- ${p.name} (Rating: ${p.rate}/7, Type: ${p.kinds.split(',').slice(0, 2).join(', ')})`
  ).join("\n");
}
