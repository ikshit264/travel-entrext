import { SummarizeJournalInput } from "./gemini";

export function buildJournalPrompt(input: SummarizeJournalInput): string {
  const { journalContent, activities, dayIndex } = input;

  return `You are a travel memory AI that creates beautiful, concise summaries of travel experiences.

DAY ${dayIndex} JOURNAL ENTRY:
${journalContent}

ACTIVITIES COMPLETED:
${JSON.stringify(activities, null, 2)}

TASK:
1. Create a concise, memory-style summary (2-3 sentences)
2. Highlight the most memorable moments
3. Capture the emotional tone of the day
4. Analyze sentiment/mood
5. Extract key themes or highlights

TONE:
- Warm and personal
- Nostalgic and reflective
- Emphasize experiences over facts
- Use vivid, sensory language

OUTPUT FORMAT (strict JSON):
{
  "aiSummary": "A beautiful 2-3 sentence summary that captures the essence of the day",
  "moodTag": "joyful|reflective|adventurous|relaxed|overwhelmed|disappointed|excited|grateful",
  "sentiment": {
    "score": 0.0-1.0,
    "label": "positive|neutral|negative"
  },
  "highlights": [
    "First memorable moment",
    "Second memorable moment",
    "Third memorable moment"
  ],
  "themes": ["theme1", "theme2", "theme3"],
  "emotionalJourney": "Brief description of how emotions evolved throughout the day"
}

Create the summary now. Return ONLY valid JSON, no additional text.`;
}
