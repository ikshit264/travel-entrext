import { GenerateItineraryInput } from "./gemini";
import { calculateDaysBetween } from "../utils";

export function buildItineraryPrompt(input: GenerateItineraryInput & { famousPlaces?: any; weatherForecast?: string }): string {
  const { destination, country, startDate, endDate, budget, currency = "USD", preferences, habitPatterns, famousPlaces } = input;
  const totalDays = calculateDaysBetween(startDate, endDate);
  const budgetPerDay = budget / totalDays;

  let habitContext = "";
  if (habitPatterns) {
    habitContext = `
LEARNED USER HABITS (use these to personalize the itinerary):
- Typical wake-up time: ${habitPatterns.learnedWakeTimeDistribution?.mean || "8:00 AM"}
- Walking tolerance: ${habitPatterns.walkingToleranceStats?.maxDistance || "5km"} per day
- Preferred cuisines: ${habitPatterns.cuisinePreferences?.preferred?.join(", ") || "varied"}
- Average meal budget: ${currency} ${habitPatterns.cuisinePreferences?.priceRange?.max || (budgetPerDay * 0.3).toFixed(0)}
- Budget behavior: ${habitPatterns.budgetBehavior?.overspendingRate > 0.2 ? "tends to overspend" : "stays within budget"}
`;
  }

  let placesContext = "";
  if (famousPlaces) {
    // Check if it's the new structured JSON format
    if (typeof famousPlaces === 'object' && famousPlaces.attractions) {
        placesContext = `
REAL FAMOUS PLACES & POIS (Use these strictly):
- Attractions: ${famousPlaces.attractions.map((p: any) => `${p.name} (${p.kinds})`).join(", ")}
- Restaurants: ${famousPlaces.restaurants.map((p: any) => `${p.name}`).join(", ")}
- Cafes: ${famousPlaces.cafes.map((p: any) => `${p.name}`).join(", ")}
- Nature: ${famousPlaces.nature.map((p: any) => `${p.name}`).join(", ")}
- Museums: ${famousPlaces.museums.map((p: any) => `${p.name}`).join(", ")}
`;
    } else {
        // Fallback for old string format if any
        placesContext = `
REAL FAMOUS PLACES (Prioritize these if they fit user preferences):
${famousPlaces}
`;
    }
  }

  let weatherContext = "";
  if (input.weatherForecast) {
    weatherContext = `
WEATHER FORECAST (Plan activities according to this weather):
${input.weatherForecast}
`;
  }

  return `You are an expert travel planner AI. Generate a detailed, day-by-day itinerary for a trip.

TRIP DETAILS:
- Destination: ${destination}, ${country}
- Dates: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} (${totalDays} days)
- Total Budget: ${currency} ${budget} (approx. ${currency} ${budgetPerDay.toFixed(2)} per day)
- Travel Style: ${preferences?.travelStyle || preferences?.pace || "balanced"}
- Interests: ${preferences?.interests?.join(", ") || "general sightseeing"}
- Budget Comfort: ${preferences?.budgetComfort || "standard"}
- Accommodation Style: ${preferences?.stayStyle || "hotel"}
- Food Preferences: ${JSON.stringify(preferences?.foodPreferences || {})}
- Activity Preferences: ${JSON.stringify(preferences?.activityPreferences || {})}
- Walking Tolerance: ${preferences?.walkingTolerance || "moderate"}
- Preferred Wake-up Time: ${preferences?.wakeUpTime || "8:00 AM"}

${habitContext}

${placesContext}

${weatherContext}

REQUIREMENTS:
1. Create a structured itinerary with ${totalDays} days
2. For each day, provide 4-7 activities with specific times
3. Each activity must include:
   - time (HH:MM format)
   - title
   - location (name, address, lat, lng coordinates)
   - category (museum, restaurant, attraction, shopping, nature, nightlife, relaxation, adventure)
   - duration (in minutes)
   - estimatedCost (in ${currency})
   - description (2-3 sentences)
   - indoor (boolean - true if activity is primarily indoors)
4. The FIRST activity of every day MUST be a 'Start from Hotel' activity.
5. The LAST activity of every day MUST be a 'Return to Hotel' or 'Check-in to new Hotel' activity.
6. Estimate the daily travel cost (transportation between activities) and provide a range.
7. Balance activities based on user preferences and weather conditions
8. Respect the budget constraints
9. Use ONLY the real famous places provided in the context above

RESPONSE FORMAT (strict JSON):
{
  "days": [
    {
      "dayIndex": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme/focus",
      "dailyTravelCost": {
        "min": 10,
        "max": 20,
        "currency": "${currency}"
      },
      "activities": [
        {
          "id": "unique-id",
          "time": "09:00",
          "title": "Start from Hotel",
          "location": {
            "name": "Hotel Name",
            "address": "Address",
            "lat": 0.0,
            "lng": 0.0
          },
          "category": "accommodation",
          "duration": 30,
          "estimatedCost": 0,
          "description": "Depart for the day's adventures",
          "indoor": true
        }
      ]
    }
  ]
}

Generate the itinerary now. Return ONLY valid JSON, no additional text.`;
}
