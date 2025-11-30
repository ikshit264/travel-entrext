import { LearnHabitsInput } from "./gemini";

export function buildHabitPrompt(input: LearnHabitsInput): string {
  const { userId, historicalTrips, edits } = input;

  return `You are a machine learning AI that analyzes user travel history to learn behavioral patterns and preferences.

USER ID: ${userId}

HISTORICAL TRIP DATA:
${JSON.stringify(historicalTrips, null, 2)}

USER EDITS AND ADJUSTMENTS:
${JSON.stringify(edits, null, 2)}

ANALYSIS TASKS:
1. **Wake Time Patterns**: Analyze actual vs. planned wake-up times
   - Calculate mean, variance, and distribution
   - Identify if user consistently wakes later than planned
   
2. **Walking Tolerance**: Analyze daily walking distances
   - Find maximum comfortable distance
   - Identify when user complained or edited due to too much walking
   - Calculate average comfortable distance
   
3. **Cuisine Preferences**: Analyze food choices
   - Identify preferred cuisines (frequency analysis)
   - Identify avoided cuisines
   - Determine typical price range for meals
   - Find typical meal times
   
4. **Budget Behavior**: Analyze spending patterns
   - Calculate overspending rate (actual vs. planned)
   - Identify which categories user tends to overspend on
   - Calculate average daily spending
   - Determine category weights (how much of budget goes to each category)

OUTPUT FORMAT (strict JSON):
{
  "learnedWakeTimeDistribution": {
    "mean": 8.5,
    "variance": 0.5,
    "samples": [8, 8.5, 9, 8, 9],
    "interpretation": "User typically wakes 30-60 minutes later than planned"
  },
  "walkingToleranceStats": {
    "maxDistance": 8000,
    "averageDistance": 5000,
    "comfortThreshold": 6000,
    "interpretation": "User comfortable with 5-6km walking per day"
  },
  "cuisinePreferences": {
    "preferred": ["italian", "japanese", "local"],
    "avoided": ["fast-food", "heavy-meat"],
    "priceRange": { "min": 15, "max": 40 },
    "mealTimes": { "breakfast": "09:00", "lunch": "13:00", "dinner": "19:30" },
    "interpretation": "Prefers mid-range dining with variety"
  },
  "budgetBehavior": {
    "overspendingRate": 0.15,
    "categoryWeights": {
      "food": 0.35,
      "attractions": 0.30,
      "transport": 0.20,
      "shopping": 0.10,
      "misc": 0.05
    },
    "averageDailySpend": 120,
    "interpretation": "Tends to overspend slightly on food and attractions"
  },
  "recommendations": [
    "Start days 30-60 minutes later than typical tourist schedules",
    "Limit walking to 5-6km per day",
    "Budget more for food experiences",
    "Include Italian and Japanese restaurants"
  ]
}

Analyze the data and return ONLY valid JSON, no additional text.`;
}
