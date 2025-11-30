import { z } from "zod";
import {
  ACCOMMODATION_TYPES,
  TRANSPORT_TYPES,
  INTERESTS,
  CUISINES,
} from "@/lib/constants";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  geminiApiKey: z.string().optional(),
  homeCity: z.string().optional(),
  homeCountry: z.string().optional(),
  travelStyle: z.preprocess((val) => val === "" ? undefined : val, z.enum(["relaxed", "balanced", "intense"]).optional()),
  budgetComfort: z.preprocess((val) => val === "" ? undefined : val, z.enum(["low", "mid", "high"]).optional()),
  accommodationStyle: z.preprocess((val) => val === "" ? undefined : val, z.enum(ACCOMMODATION_TYPES).optional()),
  transportPreferences: z.preprocess((val) => val === "" ? undefined : val, z.enum(TRANSPORT_TYPES).optional()),
  emotionalBaseline: z.any().optional(),
  preferences: z.any().optional(),
  personality: z.any().optional(),
  baselineMood: z.string().optional(),
});

export const createTripSchema = z.object({
  title: z.string().min(1, "Title is required"),
  destinationCity: z.string().min(1, "Destination city is required"),
  country: z.string().min(1, "Country is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().positive("Budget must be positive"),
  currency: z.string().default("USD"),
  travelMode: z.enum(["flight", "train", "bus", "car", "ship", "other"]).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  cityType: z.string().optional(),
  population: z.number().optional(),
  externalCityId: z.string().optional(),
  preferences: z.object({
    pace: z.enum(["relaxed", "balanced", "intense", "fast"]).optional(),
    interests: z.array(z.enum(INTERESTS)).optional(),
    travelStyle: z.string().optional(),
    budgetComfort: z.string().optional(),
    stayStyle: z.string().optional(),
    foodPreferences: z.object({
      cuisines: z.array(z.enum(CUISINES)).optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
      priceRange: z.enum(["cheap", "moderate", "expensive", "luxury"]).optional(),
    }).optional(),
    activityPreferences: z.object({
      indoor: z.number().min(0).max(1).optional(),
      outdoor: z.number().min(0).max(1).optional(),
      cultural: z.number().min(0).max(1).optional(),
      adventure: z.number().min(0).max(1).optional(),
    }).optional(),
    walkingTolerance: z.enum(["low", "moderate", "high"]).optional(),
    wakeUpTime: z.string().optional(),
  }).optional(),
});

export const moodMetricsSchema = z.object({
  tripId: z.string().optional(),
  dayPlanId: z.string().optional(),
  metrics: z.object({
    typingSpeed: z.number(),
    scrollVelocity: z.number(),
    clickHesitation: z.number(),
    editFrequency: z.number(),
    keyHesitationPattern: z.array(z.number()),
  }),
});

export const createExpenseSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  dayPlanId: z.string().optional(),
  category: z.enum(["food", "transport", "attractions", "shopping", "misc"]),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  note: z.string().optional(),
});

export const createJournalSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  dayPlanId: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
});

export const generateItinerarySchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
});

export const weatherCheckSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  dayPlanId: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type MoodMetricsInput = z.infer<typeof moodMetricsSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type GenerateItineraryInput = z.infer<typeof generateItinerarySchema>;
export type WeatherCheckInput = z.infer<typeof weatherCheckSchema>;

