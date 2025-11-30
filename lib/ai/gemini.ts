import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateItineraryInput {
  destination: string;
  country: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  currency?: string;
  preferences: any;
  habitPatterns?: any;
  famousPlaces?: string;
  weatherForecast?: string;
}

export interface AnalyzeMoodInput {
  metrics: {
    typingSpeed: number;
    scrollVelocity: number;
    clickHesitation: number;
    editFrequency: number;
    keyHesitationPattern: number[];
  };
  currentItinerary?: any;
  userContext?: any;
}

export interface LearnHabitsInput {
  userId: string;
  historicalTrips: any[];
  edits: any[];
}

export interface WeatherAwareUpdateInput {
  weatherForecast: any[];
  currentDayPlan: any;
  tripPreferences: any;
}

export interface SummarizeJournalInput {
  journalContent: string;
  activities: any[];
  dayIndex: number;
}

export async function generateItinerary(apiKey: string, input: GenerateItineraryInput) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const { buildItineraryPrompt } = await import("./itineraryPrompt");
  const prompt = buildItineraryPrompt(input);
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Failed to generate itinerary");
  }
}

export async function analyzeMood(apiKey: string, input: AnalyzeMoodInput) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const { buildMoodPrompt } = await import("./moodPrompt");
  const prompt = buildMoodPrompt(input);
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse mood analysis:", error);
    throw new Error("Failed to analyze mood");
  }
}

export async function learnHabits(apiKey: string, input: LearnHabitsInput) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const { buildHabitPrompt } = await import("./habitPrompt");
  const prompt = buildHabitPrompt(input);
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse habit learning:", error);
    throw new Error("Failed to learn habits");
  }
}

export async function weatherAwareUpdate(apiKey: string, input: WeatherAwareUpdateInput) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const { buildWeatherPrompt } = await import("./weatherPrompt");
  const prompt = buildWeatherPrompt(input);
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse weather update:", error);
    throw new Error("Failed to update for weather");
  }
}

export async function summarizeJournal(apiKey: string, input: SummarizeJournalInput) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const { buildJournalPrompt } = await import("./journalPrompt");
  const prompt = buildJournalPrompt(input);
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse journal summary:", error);
    throw new Error("Failed to summarize journal");
  }
}
