import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { buildWeatherRegenerationPrompt } from "./prompts/weather";
import { buildMoodRegenerationPrompt } from "./prompts/mood";

export type RegenerationType = "WEATHER" | "MOOD";

export interface RegenerationContext {
  apiKey: string;
  tripId: string;
  dayPlanId: string;
  type: RegenerationType;
  data: any; // WeatherData or MoodEvent data
  save?: boolean; // Defaults to true
}

export async function regenerateSegment({ apiKey, tripId, dayPlanId, type, data, save = true }: RegenerationContext) {
  try {
    // 1. Fetch current context
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { user: true },
    });

    const dayPlan = await prisma.dayPlan.findUnique({
      where: { id: dayPlanId },
    });

    if (!trip || !dayPlan) {
      throw new Error("Trip or DayPlan not found");
    }

    // 2. Select Prompt
    let prompt = "";
    if (type === "WEATHER") {
      prompt = buildWeatherRegenerationPrompt(dayPlan.activities, data, trip.preferences || {});
    } else {
      prompt = buildMoodRegenerationPrompt(dayPlan.activities, data, trip.preferences || {});
    }

    // 3. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // 4. Parse Response
    let updatedActivities;
    try {
      // Try to extract JSON from code blocks first
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonText = jsonMatch ? jsonMatch[1] : text;

      // If no code block, try to find the first '{' and last '}'
      if (!jsonMatch) {
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
          jsonText = text.substring(firstOpen, lastClose + 1);
        }
      }

      // Clean up any potential leading/trailing whitespace or non-JSON characters
      jsonText = jsonText.trim();
      
      updatedActivities = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse AI response. Raw text:", text);
      throw new Error("AI response parsing failed: " + (e as Error).message);
    }

    // 5. Update DB (Only if save is true)
    if (save) {
        const updateData: any = {
        activities: updatedActivities,
        };

        if (type === "MOOD") {
        updateData.moodEvents = {
            create: {
            userId: trip.userId,
            tripId: trip.id,
            timestamp: new Date(),
            metrics: data.metrics || {},
            inferredEmotion: data.inferredEmotion || "neutral",
            appliedChanges: { summary: "Regenerated via AI" },
            }
        };
        } else if (type === "WEATHER") {
        updateData.weatherEvents = {
            create: {
            tripId: trip.id,
            datetime: new Date(),
            location: { city: trip.destinationCity }, // Simplified
            weatherType: data.condition || "unknown",
            temperature: data.temp || 0,
            severity: data.isSevere ? "high" : "low",
            aiAdjustments: { summary: "Regenerated via AI" },
            }
        };
        }

        await prisma.dayPlan.update({
        where: { id: dayPlanId },
        data: updateData,
        });
    }
    
    // For simplicity in this iteration, we just update the activities.
    // The Event logging (WeatherEvent/MoodEvent) happens in the API route before calling this.

    return updatedActivities;

  } catch (error) {
    console.error("Regeneration failed:", error);
    throw error;
  }
}
