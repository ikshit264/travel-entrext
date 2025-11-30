import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateSegment } from "@/lib/ai/adaptive-engine";

// Simple inference logic (can be replaced by AI or more complex rules)
function inferEmotion(metrics: any) {
  const { typingSpeed, scrollVelocity, rageClicks } = metrics;
  
  if (rageClicks > 2) return "frustrated";
  if (scrollVelocity > 2000) return "overwhelmed"; // Fast scrolling
  if (typingSpeed > 5) return "excited"; // Fast typing
  if (typingSpeed < 1 && scrollVelocity < 200) return "bored"; // Slow interaction
  
  return "neutral";
}

import { requireAuth } from "@/lib/auth";

// ... (imports)

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { tripId, dayPlanId, metrics } = body;

    if (!metrics) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const userId = user.id;

    // 1. Infer Emotion
    const emotion = inferEmotion(metrics);

    // 2. Log Mood Event
    const moodEvent = await prisma.moodEvent.create({
      data: {
        userId,
        tripId, // Optional
        dayPlanId, // Optional
        metrics,
        inferredEmotion: emotion,
      },
    });

    // 3. Check for Regeneration Trigger
    // Only regenerate if mood is negative/strong and we have a trip context
    let updatedPlan = null;
    if (tripId && dayPlanId && ["frustrated", "overwhelmed", "bored"].includes(emotion)) {
       console.log(`Negative mood detected (${emotion}). Regenerating...`);
       
       // Fetch user's encrypted API key
        const userWithKey = await prisma.user.findUnique({
            where: { id: user.id },
            select: { encryptedGeminiKey: true },
        });

        if (userWithKey?.encryptedGeminiKey) {
            // Decrypt the API key
            const { decryptApiKey } = await import("@/lib/crypto");
            const apiKey = decryptApiKey(userWithKey.encryptedGeminiKey);

            updatedPlan = await regenerateSegment({
                apiKey,
                tripId,
                dayPlanId,
                type: "MOOD",
                data: { ...moodEvent, metrics }, // Pass full event data
            });

            // Update event with changes
            await prisma.moodEvent.update({
                where: { id: moodEvent.id },
                data: { appliedChanges: updatedPlan }
            });
        }
    }

    return NextResponse.json({ 
      emotion, 
      regenerated: !!updatedPlan,
      updatedPlan 
    });

  } catch (error: any) {
    console.error("Mood API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
