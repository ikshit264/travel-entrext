"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTrip } from "@/hooks/useTrip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Calendar, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function JournalPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.tripId as string;
    const { trip, loading: tripLoading } = useTrip(tripId);

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [fetchingEntries, setFetchingEntries] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch existing journal entries
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await fetch(`/api/journal?tripId=${tripId}`);
                if (response.ok) {
                    const data = await response.json();
                    setEntries(data.entries || []);
                }
            } catch (error) {
                console.error("Failed to fetch journal entries:", error);
            } finally {
                setFetchingEntries(false);
            }
        };

        if (tripId) {
            fetchEntries();
        }
    }, [tripId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Find the dayPlanId for the selected day
            let dayPlanId = null;
            if (selectedDay !== null && trip?.itineraries?.[0]?.dayPlans) {
                const dayPlan = trip.itineraries[0].dayPlans.find(
                    (dp: any) => dp.dayIndex === selectedDay
                );
                dayPlanId = dayPlan?.id || null;
            }

            const response = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tripId,
                    content,
                    dayPlanId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save entry");
            }

            const data = await response.json();
            setEntries([data.entry, ...entries]);
            setContent("");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error("Failed to create journal entry:", error);
            setError(error.message || "Failed to save entry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (tripLoading || fetchingEntries) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading journal...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <p className="text-center text-muted-foreground">Trip not found</p>
                        <Button onClick={() => router.push("/dashboard")} className="w-full mt-4">
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const dayPlans = trip.itineraries?.[0]?.dayPlans || [];
    const filteredEntries = selectedDay === null
        ? entries
        : entries.filter((entry) => {
            if (!entry.dayPlanId) return false;
            const dayPlan = dayPlans.find((dp: any) => dp.id === entry.dayPlanId);
            return dayPlan?.dayIndex === selectedDay;
        });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Responsive Navigation */}
            <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
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
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
                {/* Responsive Header */}
                <div className="mb-6 sm:mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Travel Journal
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                        {trip.title} • {trip.destinationCity}, {trip.country}
                    </p>
                </div>

                {/* Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Sidebar - Day Selector (Responsive) */}
                    <div className="lg:col-span-1">
                        <Card className="lg:sticky lg:top-24 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Select Day
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Filter entries by day</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 p-4 sm:p-6">
                                <Button
                                    variant={selectedDay === null ? "default" : "outline"}
                                    className="w-full justify-start text-sm sm:text-base"
                                    onClick={() => setSelectedDay(null)}
                                >
                                    All Days ({entries.length})
                                </Button>
                                {dayPlans.map((dayPlan: any) => {
                                    const dayEntries = entries.filter(e => {
                                        if (!e.dayPlanId) return false;
                                        const dp = dayPlans.find((d: any) => d.id === e.dayPlanId);
                                        return dp?.dayIndex === dayPlan.dayIndex;
                                    });
                                    return (
                                        <Button
                                            key={dayPlan.id}
                                            variant={selectedDay === dayPlan.dayIndex ? "default" : "outline"}
                                            className="w-full justify-start text-sm sm:text-base"
                                            onClick={() => setSelectedDay(dayPlan.dayIndex)}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>Day {dayPlan.dayIndex}</span>
                                                <span className="text-xs opacity-70">({dayEntries.length})</span>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Responsive Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* New Entry Form - Responsive */}
                        <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg md:text-xl">
                                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                    <span>Write New Entry</span>
                                    {selectedDay !== null && (
                                        <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold">
                                            Day {selectedDay}
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    {selectedDay === null
                                        ? "Select a day from the sidebar to link your entry"
                                        : `Writing about Day ${selectedDay} of your trip`
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-red-900">Error</p>
                                                <p className="text-sm text-red-800">{error}</p>
                                            </div>
                                        </div>
                                    )}
                                    {success && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-800 font-semibold">✓ Entry saved successfully!</p>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-sm sm:text-base">Your thoughts and experiences</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="What did you experience today? What were the highlights? How did you feel? Share your memories..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={8}
                                            required
                                            className="resize-none text-sm sm:text-base"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {content.length} characters
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={loading} size="lg" className="w-full">
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Entry"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Entries List - Responsive */}
                        <div className="space-y-4">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold flex items-center gap-2">
                                {selectedDay === null ? "All Entries" : `Day ${selectedDay} Entries`}
                                <span className="text-base font-normal text-muted-foreground">
                                    ({filteredEntries.length})
                                </span>
                            </h2>

                            {filteredEntries.length === 0 ? (
                                <Card className="bg-white/60 backdrop-blur-sm">
                                    <CardContent className="py-12 sm:py-16 text-center p-4 sm:p-6">
                                        <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-4" />
                                        <p className="text-base sm:text-lg text-muted-foreground mb-2">
                                            {selectedDay === null
                                                ? "No journal entries yet"
                                                : `No entries for Day ${selectedDay} yet`
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground/70">
                                            Start documenting your journey above!
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredEntries.map((entry) => {
                                    const entryDayPlan = entry.dayPlanId
                                        ? dayPlans.find((dp: any) => dp.id === entry.dayPlanId)
                                        : null;

                                    return (
                                        <Card key={entry.id} className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                                            <CardHeader className="pb-3 p-4 sm:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                    <div className="flex-1">
                                                        {entryDayPlan && (
                                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold">
                                                                    Day {entryDayPlan.dayIndex}
                                                                </span>
                                                                <span className="text-xs sm:text-sm text-muted-foreground">
                                                                    {formatDate(entryDayPlan.date)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <CardDescription className="text-xs">
                                                            Written {new Date(entry.createdAt).toLocaleDateString("en-US", {
                                                                weekday: "short",
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </CardDescription>
                                                    </div>
                                                    {entry.moodTag && (
                                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                            {entry.moodTag}
                                                        </span>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                                                    {entry.content}
                                                </p>
                                                {entry.aiSummary && (
                                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                                            <p className="text-sm font-semibold text-blue-900">AI Summary</p>
                                                        </div>
                                                        <p className="text-sm text-blue-800/90 leading-relaxed">{entry.aiSummary}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
