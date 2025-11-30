import { AnalyzeMoodInput } from "./gemini";

export function buildMoodPrompt(input: AnalyzeMoodInput): string {
  const { metrics, currentItinerary, userContext } = input;

  return `You are an emotional intelligence AI that analyzes user behavior to infer emotional state and suggest itinerary adjustments.

BEHAVIORAL METRICS:
- Typing Speed: ${metrics.typingSpeed} chars/second (baseline: 3-5 chars/sec)
- Scroll Velocity: ${metrics.scrollVelocity} px/second (baseline: 200-400 px/sec)
- Click Hesitation: ${metrics.clickHesitation} ms (baseline: 200-500 ms)
- Edit Frequency: ${metrics.editFrequency} edits/minute (baseline: 1-3 edits/min)
- Key Hesitation Pattern: ${JSON.stringify(metrics.keyHesitationPattern)} ms between keystrokes

INTERPRETATION GUIDELINES:
- High typing speed + low hesitation = excited, confident
- Low typing speed + high hesitation = stressed, uncertain, overwhelmed
- High edit frequency = indecisive, anxious, perfectionist
- Very high scroll velocity = impatient, bored
- Very low scroll velocity = tired, disengaged

${currentItinerary ? `CURRENT ITINERARY CONTEXT:\n${JSON.stringify(currentItinerary, null, 2)}` : ""}

${userContext ? `USER CONTEXT:\n${JSON.stringify(userContext, null, 2)}` : ""}

TASK:
1. Analyze the behavioral metrics
2. Infer the user's emotional state (stressed, excited, bored, overwhelmed, neutral, tired)
3. Suggest specific itinerary adjustments based on the inferred emotion:
   - If stressed/overwhelmed: reduce activity density, add breaks, suggest quieter activities
   - If bored: add more exciting/exploratory activities, increase variety
   - If tired: adjust wake-up times, reduce walking, add relaxation
   - If excited: maintain or increase activity level, add more adventurous options
   - If neutral: maintain current plan

OUTPUT FORMAT (strict JSON):
{
  "inferredEmotion": "stressed|excited|bored|overwhelmed|neutral|tired",
  "confidence": 0.0-1.0,
  "reasoning": "Explanation of why this emotion was inferred",
  "suggestedAdjustments": {
    "changeType": "reduce_density|add_breaks|increase_variety|adjust_timing|add_relaxation",
    "specificChanges": [
      {
        "dayIndex": 1,
        "activityId": "activity-id",
        "action": "remove|replace|adjust_time|add_break_after",
        "reason": "Why this change helps",
        "replacement": {
          "title": "New activity if replacing",
          "description": "Details"
        }
      }
    ]
  }
}

Analyze now. Return ONLY valid JSON, no additional text.`;
}
