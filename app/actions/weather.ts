"use server";

import { getForecast, WeatherData } from "@/lib/weather";

export async function fetchForecast(city: string): Promise<WeatherData[]> {
  try {
    return await getForecast(city);
  } catch (error) {
    console.error("Failed to fetch forecast in action:", error);
    return [];
  }
}

export async function fetchForecastByCoordinates(lat: number, lon: number): Promise<WeatherData[]> {
  try {
    const { getForecastByCoordinates } = await import("@/lib/weather");
    return await getForecastByCoordinates(lat, lon);
  } catch (error) {
    console.error("Failed to fetch forecast by coordinates in action:", error);
    return [];
  }
}
