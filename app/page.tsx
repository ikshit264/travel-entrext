"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Cloud, TrendingUp, MapPin, Sparkles, Zap } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.log("Not authenticated");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Responsive Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TravelAI
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-sm sm:text-base px-3 sm:px-4"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="text-sm sm:text-base px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Sign Up</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Responsive */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-4">
            Your AI-Powered Travel Companion
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Experience intelligent trip planning that adapts to your mood, learns your habits, and optimizes for weather conditions.
          </p>
          <Button
            size="lg"
            className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto max-w-sm mx-4 sm:mx-0"
            onClick={() => router.push("/signup")}
          >
            Start Planning Your Trip
            <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Feature Cards - Responsive Grid */}
        <div className="flex md:flex-row gap-4 sm:gap-6 mb-12 sm:mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Instant Personalization</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Get a personalized itinerary in seconds, even if you're planning just a moment before you leave
              </CardDescription>
            </CardHeader>
          </Card>


          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <Cloud className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Weather-Smart Replanning</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Automatically adjusts your plans when weather changes, suggesting indoor alternatives
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="p-4 sm:p-6">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Habit Learning Engine</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Learns from your travel history to personalize future trips to your preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Smart Features Section - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Smart Features</h2>
            <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-700">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 flex-shrink-0" />
                <span>AI-generated itineraries optimized for minimal travel time</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 flex-shrink-0" />
                <span>Real-time budget tracking with expense categorization</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 flex-shrink-0" />
                <span>Interactive maps with route optimization</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-1 flex-shrink-0" />
                <span>Travel journal with AI-generated summaries</span>
              </li>
            </ul>
          </div>
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white order-1 lg:order-2">
            <CardHeader className="p-0 mb-4 sm:mb-6">
              <CardTitle className="text-white text-2xl sm:text-3xl mb-2 sm:mb-3">Ready to explore?</CardTitle>
              <CardDescription className="text-blue-100 text-base sm:text-lg">
                Join thousands of travelers using AI to plan their perfect trips
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Button
                size="lg"
                variant="secondary"
                className="w-full text-base sm:text-lg"
                onClick={() => router.push("/signup")}
              >
                Create Free Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Responsive Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-12 sm:mt-16 md:mt-20 border-t">
        <p className="text-center text-sm sm:text-base text-gray-600">
          © 2024 TravelAI. Powered by Gemini AI.
        </p>
      </footer>
    </div>
  );
}
