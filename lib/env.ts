import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional(), // Optional - users provide their own API keys
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  WEATHER_API_KEY: z.string().min(1),
  OPENTRIPMAP_API_KEY: z.string().optional(), // Optional for now to avoid breaking if not set
});

export const env = envSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  WEATHER_API_KEY: process.env.WEATHER_API_KEY,
  OPENTRIPMAP_API_KEY: process.env.OPENTRIPMAP_API_KEY,
});

export type Env = z.infer<typeof envSchema>;
