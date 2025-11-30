import { WeatherAwareUpdateInput } from "./gemini";

export function buildWeatherPrompt(input: WeatherAwareUpdateInput): string {
  const { weatherForecast, currentDayPlan, tripPreferences } = input;

  return `You are a weather-adaptive travel planning AI. Adjust itineraries based on weather forecasts.

WEATHER FORECAST:
${JSON.stringify(weatherForecast, null, 2)}

CURRENT DAY PLAN:
${JSON.stringify(currentDayPlan, null, 2)}

TRIP PREFERENCES:
${JSON.stringify(tripPreferences, null, 2)}

WEATHER ADAPTATION RULES:
1. **Rain**: 
   - Move outdoor activities indoors or under cover
   - Suggest museums, galleries, shopping malls, covered markets
   - Add umbrella/rain gear reminders
   - Reduce walking distance between locations

2. **Extreme Heat** (>35°C/95°F):
   - Schedule outdoor activities early morning or late evening
   - Add more indoor activities during peak heat (11 AM - 4 PM)
   - Suggest air-conditioned venues
   - Increase hydration reminders
   - Reduce walking intensity

3. **Snow/Cold** (<0°C/32°F):
   - Prioritize indoor activities
   - Suggest winter-specific activities (ice skating, winter markets)
   - Reduce outdoor walking time
   - Add warm clothing reminders

4. **Severe Weather**:
   - Cancel outdoor activities entirely
   - Suggest indoor alternatives
   - Add safety warnings

TASK:
1. Identify weather issues for each activity time slot
2. Determine which activities need adjustment
3. Suggest specific replacements or time changes
4. Maintain the overall trip theme and preferences
5. Keep similar budget and activity count

OUTPUT FORMAT (strict JSON):
{
  "weatherIssues": [
    {
      "datetime": "2024-01-15T14:00:00Z",
      "weatherType": "rain",
      "severity": "medium",
      "affectedActivities": ["activity-id-1", "activity-id-2"]
    }
  ],
  "adjustments": [
    {
      "activityId": "activity-id-1",
      "originalActivity": {
        "title": "Original activity",
        "time": "14:00"
      },
      "issue": "Heavy rain expected",
      "action": "replace|reschedule|cancel",
      "replacement": {
        "time": "14:00",
        "title": "New indoor activity",
        "location": {
          "name": "Location name",
          "address": "Address",
          "lat": 0.0,
          "lng": 0.0
        },
        "category": "museum",
        "duration": 120,
        "estimatedCost": 20,
        "description": "Description",
        "indoor": true
      },
      "reason": "Why this change was made"
    }
  ],
  "summary": "Overall summary of weather-based changes"
}

Analyze and adjust now. Return ONLY valid JSON, no additional text.`;
}
