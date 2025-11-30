"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTrip } from "@/hooks/useTrip";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, DollarSign, Car } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { DayChatDialog } from "@/components/itinerary/DayChatDialog";
import { WeatherData } from "@/lib/weather";
import { fetchForecast } from "@/app/actions/weather";
import { WeatherBadge } from "@/components/weather/WeatherBadge";

export default function ItineraryPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.tripId as string;
    const { trip, loading } = useTrip(tripId);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [forecast, setForecast] = useState<WeatherData[]>([]);



    useEffect(() => {
        if (trip?.destinationCity) {
            fetchForecast(trip.destinationCity).then(setForecast);
        }
    }, [trip?.destinationCity]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!trip || !trip.itineraries || trip.itineraries.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>No Itinerary Yet</CardTitle>
                        <CardDescription>Generate an itinerary for this trip</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push(`/trip/${tripId}`)}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const itinerary = trip.itineraries[0];
    const dayPlans = itinerary.dayPlans || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Responsive Navigation */}
            <nav className="border-b bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/trip/${tripId}`)}
                        className="text-sm sm:text-base"
                    >
                        ← Back to Trip
                    </Button>
                </div>
            </nav>

            {/* Responsive Main Container */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Your Itinerary</h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{itinerary.summary}</p>
                </div>

                <div className="space-y-6">
                    {dayPlans.map((dayPlan: any) => {
                        const activities = dayPlan.activities as any[];

                        // Safe date parsing
                        let dayDate = "";
                        try {
                            dayDate = new Date(dayPlan.date).toISOString().split('T')[0];
                        } catch (e) {
                            console.error("Invalid date:", dayPlan.date);
                        }

                        // Match forecast by date for the daily badge (aim for noon)
                        let weatherForDay = forecast.find(f => {
                            const forecastDate = new Date(f.dt * 1000).toISOString().split('T')[0];
                            const isSameDate = forecastDate === dayDate;
                            const isNoon = new Date(f.dt * 1000).getHours() === 12;
                            return isSameDate && isNoon;
                        }) || forecast.find(f => {
                            const forecastDate = new Date(f.dt * 1000).toISOString().split('T')[0];
                            return forecastDate === dayDate;
                        });

                        // Fallback for future dates (beyond 5-day forecast)
                        if (!weatherForDay && forecast.length > 0) {
                            const uniqueDays = Array.from(new Set(forecast.map(f => new Date(f.dt * 1000).toISOString().split('T')[0])));
                            const targetDayIndex = (dayPlan.dayIndex - 1) % uniqueDays.length;
                            const targetDate = uniqueDays[targetDayIndex];

                            weatherForDay = forecast.find(f => {
                                const d = new Date(f.dt * 1000).toISOString().split('T')[0];
                                return d === targetDate && new Date(f.dt * 1000).getHours() === 12;
                            }) || forecast.find(f => new Date(f.dt * 1000).toISOString().split('T')[0] === targetDate);
                        }

                        return (
                            <Card key={dayPlan.id} className="overflow-hidden">
                                <CardHeader className="bg-primary/5 p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                                            <div>
                                                <CardTitle className="text-lg sm:text-xl">Day {dayPlan.dayIndex}</CardTitle>
                                                <CardDescription className="text-sm sm:text-base">
                                                    {dayDate ? new Date(dayPlan.date).toLocaleDateString("en-US", {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }) : "Date not set"}
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {weatherForDay && <WeatherBadge weather={weatherForDay} />}
                                                {(dayPlan.routeInfo as any)?.cost && (
                                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground bg-white/50 px-2 py-1 rounded-md border shadow-sm">
                                                        <Car className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        <span className="hidden sm:inline">
                                                            Travel: {formatCurrency((dayPlan.routeInfo as any).cost.min, trip.currency)} - {formatCurrency((dayPlan.routeInfo as any).cost.max, trip.currency)}
                                                        </span>
                                                        <span className="sm:hidden">
                                                            {formatCurrency((dayPlan.routeInfo as any).cost.min, trip.currency)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <DayChatDialog
                                            tripId={tripId}
                                            dayPlanId={dayPlan.id}
                                            dayIndex={dayPlan.dayIndex}
                                            currentActivities={activities}
                                            onUpdate={() => window.location.reload()}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        {(activities || []).map((activity: any, idx: number) => {
                                            // Find weather for this specific activity time
                                            let activityWeather = null;
                                            if (dayDate && activity.time) {
                                                const [hours, minutes] = activity.time.split(':').map(Number);
                                                const activityDateTime = new Date(dayDate);
                                                activityDateTime.setHours(hours, minutes);

                                                // Find closest forecast within 3 hours
                                                activityWeather = forecast.find(f => {
                                                    const forecastTime = f.dt * 1000;
                                                    const diff = Math.abs(forecastTime - activityDateTime.getTime());
                                                    return diff < 3 * 60 * 60 * 1000;
                                                });

                                                // Fallback for future dates
                                                if (!activityWeather && forecast.length > 0) {
                                                    const uniqueDays = Array.from(new Set(forecast.map(f => new Date(f.dt * 1000).toISOString().split('T')[0])));
                                                    const targetDayIndex = (dayPlan.dayIndex - 1) % uniqueDays.length;
                                                    const targetDate = uniqueDays[targetDayIndex];
                                                    const targetDateTime = new Date(targetDate);
                                                    targetDateTime.setHours(hours, minutes);

                                                    activityWeather = forecast.find(f => {
                                                        const fDate = new Date(f.dt * 1000);
                                                        if (fDate.toISOString().split('T')[0] !== targetDate) return false;
                                                        const diff = Math.abs(fDate.getTime() - targetDateTime.getTime());
                                                        return diff < 3 * 60 * 60 * 1000;
                                                    }) || forecast.find(f => new Date(f.dt * 1000).toISOString().split('T')[0] === targetDate);
                                                }
                                            }

                                            return (
                                                <div
                                                    key={activity.id || idx}
                                                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:bg-accent/50 transition-colors group relative"
                                                >
                                                    <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:w-16 sm:text-center">
                                                        <p className="font-semibold text-primary text-sm sm:text-base">{activity.time}</p>
                                                        {activityWeather && (
                                                            <div className="sm:mt-1 flex flex-col items-center justify-center scale-75 sm:scale-75 origin-left sm:origin-top">
                                                                <WeatherBadge weather={activityWeather} minimal />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-base sm:text-lg mb-1">{activity.title}</h4>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {activity.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                                                <span className="truncate">{activity.location?.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                                                <span>{formatDuration(activity.duration)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                                                <span>{formatCurrency(activity.estimatedCost, trip.currency)}</span>
                                                            </div>
                                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs capitalize">
                                                                {activity.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
