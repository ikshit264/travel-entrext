import { WeatherData } from "@/lib/weather";

export function buildWeatherRegenerationPrompt(
  currentPlan: any,
  weather: WeatherData,
  userPreferences: any
) {
  return `
    You are an AI Travel Assistant specializing in adaptive itinerary management.
    
    CONTEXT:
    The user has a planned day in their trip, but the weather forecast has changed.
    You need to regenerate ONLY the parts of the itinerary that are affected by this weather.
    
    CURRENT WEATHER:
    - Condition: ${weather.condition} (${weather.description})
    - Temperature: ${weather.temperature}°C
    - Wind: ${weather.windSpeed} km/h
    - Risk Type: ${weather.riskType}
    
    USER PREFERENCES:
    - Interests: ${JSON.stringify(userPreferences.interests || [])}
    - Pace: ${userPreferences.pace || "balanced"}
    - Budget: ${userPreferences.budget || "moderate"}
    
    CURRENT DAY PLAN (JSON):
    ${JSON.stringify(currentPlan, null, 2)}
    
    INSTRUCTIONS:
    1. Analyze the "activities" in the Current Day Plan.
    2. Identify activities that are UNSUITABLE for the current weather (e.g., outdoor walking in rain, hiking in storm, beach in cold).
    3. Replace ONLY those activities with suitable alternatives (e.g., indoor museums, cafes, shopping malls for rain).
    4. Keep the time slots and logical flow consistent.
    5. DO NOT change activities that are already suitable (e.g., lunch at a restaurant, visiting a museum).
    6. If no changes are needed, return the original plan exactly.
    
    OUTPUT FORMAT:
    Return ONLY a valid JSON object representing the UPDATED Day Plan. 
    The structure must match the "CURRENT DAY PLAN" input exactly.
    Do not include markdown formatting or explanations.
  `;
}
