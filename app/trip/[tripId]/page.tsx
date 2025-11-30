"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTrip } from "@/hooks/useTrip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, FileText, Map, Plane, BookOpen } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.tripId as string;
    const { trip, loading } = useTrip(tripId);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your trip...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground mb-4">Trip not found</p>
                        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tripDuration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Responsive Navigation */}
            <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push("/dashboard")}
                        className="text-sm sm:text-base"
                    >
                        ← Back to Dashboard
                    </Button>
                </div>
            </nav>

            {/* Responsive Main Container */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
                {/* Hero Section - Responsive */}
                <div className="relative mb-8 sm:mb-12 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 md:p-12 text-white shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full">
                                <Plane className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            <span className="px-3 sm:px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                                {trip.itineraries?.length > 0 ? "Ready to Explore" : "Planning"}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">{trip.title}</h1>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>{trip.destinationCity}, {trip.country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>{tripDuration} {tripDuration === 1 ? 'day' : 'days'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <p className="text-xs sm:text-sm opacity-90 mb-1">Start Date</p>
                                <p className="text-sm sm:text-base font-semibold">{formatDate(trip.startDate)}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <p className="text-xs sm:text-sm opacity-90 mb-1">End Date</p>
                                <p className="text-sm sm:text-base font-semibold">{formatDate(trip.endDate)}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <p className="text-xs sm:text-sm opacity-90 mb-1">Budget</p>
                                <p className="text-sm sm:text-base font-semibold">{formatCurrency(trip.budget)}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <p className="text-xs sm:text-sm opacity-90 mb-1">Travel Mode</p>
                                <p className="text-sm sm:text-base font-semibold capitalize">{trip.travelMode || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - Responsive Grid */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Explore Your Trip</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <Card
                            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 bg-white/80 backdrop-blur-sm overflow-hidden"
                            onClick={() => router.push(`/trip/${tripId}/itinerary`)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <CardHeader className="relative">
                                <div className="mb-4 p-4 bg-blue-100 rounded-full w-fit group-hover:scale-110 transition-transform">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-xl">View Itinerary</CardTitle>
                                <CardDescription>See your day-by-day travel plan with activities and routes</CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-center text-sm text-primary font-medium">
                                    <span>Explore →</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-white/80 backdrop-blur-sm overflow-hidden"
                            onClick={() => router.push(`/trip/${tripId}/map`)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <CardHeader className="relative">
                                <div className="mb-4 p-4 bg-purple-100 rounded-full w-fit group-hover:scale-110 transition-transform">
                                    <Map className="h-8 w-8 text-purple-600" />
                                </div>
                                <CardTitle className="text-xl">View Map</CardTitle>
                                <CardDescription>Explore locations and routes on an interactive map</CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                        Coming Soon
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300 bg-white/80 backdrop-blur-sm overflow-hidden"
                            onClick={() => router.push(`/trip/${tripId}/journal`)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <CardHeader className="relative">
                                <div className="mb-4 p-4 bg-indigo-100 rounded-full w-fit group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-8 w-8 text-indigo-600" />
                                </div>
                                <CardTitle className="text-xl">Travel Journal</CardTitle>
                                <CardDescription>Document your experiences and memories day by day</CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-center text-sm text-primary font-medium">
                                    <span>Write →</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Trip Preferences - Responsive */}
                {trip.preferences && (
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                Trip Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {trip.preferences.travelStyle && (
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-muted-foreground mb-1">Travel Style</p>
                                        <p className="font-semibold capitalize">{trip.preferences.travelStyle}</p>
                                    </div>
                                )}
                                {trip.preferences.budgetComfort && (
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                        <p className="text-sm text-muted-foreground mb-1">Budget Comfort</p>
                                        <p className="font-semibold capitalize">{trip.preferences.budgetComfort}</p>
                                    </div>
                                )}
                                {trip.preferences.stayStyle && (
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-muted-foreground mb-1">Stay Style</p>
                                        <p className="font-semibold capitalize">{trip.preferences.stayStyle}</p>
                                    </div>
                                )}
                                {trip.preferences.interests && trip.preferences.interests.length > 0 && (
                                    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                                        <p className="text-sm text-muted-foreground mb-1">Interests</p>
                                        <div className="flex flex-wrap gap-1">
                                            {trip.preferences.interests.slice(0, 3).map((interest: string) => (
                                                <span key={interest} className="text-xs px-2 py-1 bg-white rounded-full">
                                                    {interest}
                                                </span>
                                            ))}
                                            {trip.preferences.interests.length > 3 && (
                                                <span className="text-xs px-2 py-1 bg-white rounded-full">
                                                    +{trip.preferences.interests.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
