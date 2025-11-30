import { env } from "./env";

const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

export interface OpenTripMapPlace {
  xid: string;
  name: string;
  rate: number;
  osm?: string;
  wikidata?: string;
  kinds: string;
  point: {
    lon: number;
    lat: number;
  };
  dist?: number;
  preview?: {
    source: string;
  };
  wikipedia?: string;
  wikipedia_extracts?: {
    title: string;
    text: string;
    html: string;
  };
}

export async function getPlacesByRadius(
  lat: number,
  lon: number,
  radius: number = 5000, // meters
  kinds: string = "interesting_places,foods,accomodations",
  limit: number = 20
): Promise<OpenTripMapPlace[]> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) {
    console.warn("OPENTRIPMAP_API_KEY is missing. Returning empty list.");
    return [];
  }

  try {
    const url = `${BASE_URL}/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=${kinds}&rate=2&format=json&limit=${limit}&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OpenTripMap API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch places from OpenTripMap:", error);
    return [];
  }
}

export async function getPlaceDetails(xid: string): Promise<OpenTripMapPlace | null> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${BASE_URL}/xid/${xid}?apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch details for place ${xid}:`, error);
    return null;
  }
}
