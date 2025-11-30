export interface Activity {
  id: string;
  time: string;
  title: string;
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  category: string;
  duration: number;
  estimatedCost: number;
  description: string;
  indoor: boolean;
}

export interface RouteInfo {
  coordinates: Array<{ lat: number; lng: number }>;
  polyline: string;
  totalDistance: number;
  totalTime: number;
  segments: Array<{
    from: string;
    to: string;
    distance: number;
    duration: number;
    mode: string;
  }>;
}

export interface MoodMetrics {
  typingSpeed: number;
  scrollVelocity: number;
  clickHesitation: number;
  editFrequency: number;
  keyHesitationPattern: number[];
}

export interface HabitPatternData {
  wakeTimeDistribution: {
    mean: number;
    variance: number;
    samples: number[];
  };
  walkingTolerance: {
    maxDistance: number;
    averageDistance: number;
    comfortThreshold: number;
  };
  cuisinePreferences: {
    preferred: string[];
    avoided: string[];
    priceRange: { min: number; max: number };
    mealTimes: { breakfast: string; lunch: string; dinner: string };
  };
  budgetBehavior: {
    overspendingRate: number;
    categoryWeights: Record<string, number>;
    averageDailySpend: number;
  };
}

export interface TripPreferences {
  pace: string;
  interests: string[];
  foodPreferences: {
    cuisines: string[];
    dietaryRestrictions: string[];
    priceRange: string;
  };
  activityPreferences: {
    indoor: number;
    outdoor: number;
    cultural: number;
    adventure: number;
  };
  walkingTolerance: string;
  wakeUpTime: string;
}

export interface WeatherData {
  datetime: string;
  temperature: number;
  weatherType: string;
  severity: string;
  precipitation: number;
  windSpeed: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
  homeCity?: string;
  homeCountry?: string;
  travelStyle?: string;
  budgetComfort?: string;
  accommodationStyle?: string;
  transportPreferences?: string;
  emotionalBaseline?: any;
  preferences?: any;
  personality?: any;
  baselineMood?: string;
  hasApiKey?: boolean;
  createdAt: Date;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destinationCity: string;
  country: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  preferences?: TripPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayPlanData {
  id: string;
  date: Date;
  dayIndex: number;
  activities: Activity[];
  routeInfo?: RouteInfo;
  moodAdjustments?: any;
}
