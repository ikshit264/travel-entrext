import { env } from "./env";

export type WeatherCondition = "Rain" | "Drizzle" | "Thunderstorm" | "Snow" | "Clear" | "Clouds" | "Mist" | "Smoke" | "Haze" | "Dust" | "Fog" | "Sand" | "Ash" | "Squall" | "Tornado";

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number; // Celsius
  windSpeed: number; // km/h
  humidity: number; // %
  description: string;
  isSevere: boolean;
  riskType: "RISK_RAIN" | "RISK_HEAT" | "RISK_COLD" | "WIND_RISK" | "EXTREME" | null;
  dt: number; // Unix timestamp
}

const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function getWeather(city: string): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${env.WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    return parseWeatherData(data);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
}

export async function getForecast(city: string): Promise<WeatherData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${env.WEATHER_API_KEY}`
    );

    if (!response.ok) {
        console.error(`Forecast API error: ${response.statusText}`);
        return [];
    }

    const data = await response.json();
    
    // Return all 3-hour intervals for granular matching
    return data.list.map((item: any) => parseWeatherData(item));
  } catch (error) {
    console.error("Failed to fetch forecast:", error);
    return [];
  }
}

export async function getForecastByCoordinates(lat: number, lon: number): Promise<WeatherData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${env.WEATHER_API_KEY}`
    );

    if (!response.ok) {
        console.error(`Forecast API error: ${response.statusText}`);
        return [];
    }

    const data = await response.json();
    return data.list.map((item: any) => parseWeatherData(item));
  } catch (error) {
    console.error("Failed to fetch forecast by coordinates:", error);
    return [];
  }
}

function parseWeatherData(data: any): WeatherData {
  const main = data.weather[0].main as WeatherCondition;
  const temp = data.main.temp;
  const wind = data.wind.speed * 3.6; // Convert m/s to km/h

  let riskType: WeatherData["riskType"] = null;
  let isSevere = false;

  // Risk Analysis
  if (["Rain", "Drizzle", "Thunderstorm"].includes(main)) {
    riskType = "RISK_RAIN";
    isSevere = true;
  } else if (temp > 34) {
    riskType = "RISK_HEAT";
    isSevere = true;
  } else if (temp < 4) {
    riskType = "RISK_COLD";
    isSevere = true;
  } else if (wind > 40) {
    riskType = "WIND_RISK";
    isSevere = true;
  } else if (["Tornado", "Squall", "Ash", "Sand", "Dust", "Thunderstorm"].includes(main)) { // Thunderstorm included in Rain but also Extreme
     // Prioritize Extreme if strictly needed, but Rain covers it for itinerary purposes usually.
     // Let's keep specific Extreme check for non-rain extremes
     if (main !== "Thunderstorm") {
         riskType = "EXTREME";
         isSevere = true;
     }
  }

  return {
    condition: main,
    temperature: temp,
    windSpeed: wind,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    isSevere,
    riskType,
    dt: data.dt,
  };
}
