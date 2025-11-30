"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrip } from "@/hooks/useTrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationSelector } from "@/components/inputs/LocationSelector";
import { CitySelector } from "@/components/inputs/CitySelector";
import { INTERESTS, CURRENCIES } from "@/lib/constants";
import { TripLoader } from "@/components/ui/TripLoader";

export default function NewTripPage() {
    const router = useRouter();
    const { createTrip, generateItinerary } = useTrip();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        destinationCity: "",
        country: "",
        startDate: "",
        endDate: "",
        budget: "",
        currency: "USD",
        travelMode: "",
        interests: [] as string[],
        travelStyle: "",
        budgetComfort: "",
        stayStyle: "",
        selectedCity: undefined as any,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const trip = await createTrip({
                ...formData,
                budget: parseFloat(formData.budget),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                // Pass geo-data
                latitude: formData.selectedCity?.latitude,
                longitude: formData.selectedCity?.longitude,
                cityType: formData.selectedCity?.cityType,
                population: formData.selectedCity?.population,
                externalCityId: formData.selectedCity?.externalId,
                preferences: {
                    interests: formData.interests,
                    pace: "balanced",
                    travelStyle: formData.travelStyle,
                    budgetComfort: formData.budgetComfort,
                    stayStyle: formData.stayStyle,
                },
            });

            // 2. Fetch Famous Places (Context for AI)
            if (trip.latitude && trip.longitude) {
                try {
                    await fetch("/api/places/fetch-favorites", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            tripId: trip.id,
                            latitude: trip.latitude,
                            longitude: trip.longitude,
                        }),
                    });
                } catch (placeError) {
                    console.error("Failed to fetch famous places (non-fatal):", placeError);
                }
            }

            // 3. Generate Itinerary (now with context)
            await generateItinerary(trip.id);
            router.push(`/trip/${trip.id}/itinerary`);
        } catch (error: any) {
            console.error("Failed to create trip:", error);
            setError(error.message || "Failed to create trip. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {loading && <TripLoader />}
            {/* Responsive Navigation */}
            <nav className="border-b bg-white/50 backdrop-blur-sm">
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
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
                <Card className="shadow-lg">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-2xl sm:text-3xl">Create New Trip</CardTitle>
                        <CardDescription className="text-sm sm:text-base">Tell us about your travel plans</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                <p className="font-semibold">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Trip Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Summer in Paris"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <LocationSelector
                                    countryValue={formData.country}
                                    cityValue=""
                                    onCountryChange={(country) => setFormData(prev => ({
                                        ...prev,
                                        country,
                                        destinationCity: "",
                                        selectedCity: undefined
                                    }))}
                                    onCityChange={() => { }}
                                    disabledCity={true}
                                />

                                <div className="space-y-2">
                                    <Label>Destination City</Label>
                                    <CitySelector
                                        country={formData.country}
                                        value={formData.selectedCity}
                                        onSelect={(city) => setFormData(prev => ({
                                            ...prev,
                                            destinationCity: city.name,
                                            selectedCity: city
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Total Budget</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        placeholder="e.g., 2000"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES?.map((c) => (
                                                <SelectItem key={c.code} value={c.code}>
                                                    {c.code} - {c.name} ({c.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="travelMode">Travel Mode to Destination</Label>
                                <Select
                                    value={formData.travelMode}
                                    onValueChange={(value) => setFormData({ ...formData, travelMode: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="How will you travel?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="flight">✈️ Flight</SelectItem>
                                        <SelectItem value="train">🚂 Train</SelectItem>
                                        <SelectItem value="bus">🚌 Bus</SelectItem>
                                        <SelectItem value="car">🚗 Car</SelectItem>
                                        <SelectItem value="ship">🚢 Ship/Ferry</SelectItem>
                                        <SelectItem value="other">🎲 Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Interests (select all that apply)</Label>
                                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2">
                                    {INTERESTS.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => {
                                                const newInterests = formData.interests.includes(interest)
                                                    ? formData.interests.filter((i) => i !== interest)
                                                    : [...formData.interests, interest];
                                                setFormData({ ...formData, interests: newInterests });
                                            }}
                                            className={`p-2 sm:p-3 border-2 rounded-lg capitalize transition-all text-sm sm:text-base ${formData.interests.includes(interest)
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="travelStyle">Travel Style</Label>
                                    <Select
                                        value={formData.travelStyle}
                                        onValueChange={(value) => setFormData({ ...formData, travelStyle: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="solo">Solo</SelectItem>
                                            <SelectItem value="couple">Couple</SelectItem>
                                            <SelectItem value="family">Family</SelectItem>
                                            <SelectItem value="group">Group</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budgetComfort">Budget Comfort</Label>
                                    <Select
                                        value={formData.budgetComfort}
                                        onValueChange={(value) => setFormData({ ...formData, budgetComfort: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select comfort" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="budget">Budget</SelectItem>
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                            <SelectItem value="luxury">Luxury</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stayStyle">Stay Style</Label>
                                    <Select
                                        value={formData.stayStyle}
                                        onValueChange={(value) => setFormData({ ...formData, stayStyle: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select stay" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hostel">Hostel</SelectItem>
                                            <SelectItem value="hotel">Hotel</SelectItem>
                                            <SelectItem value="airbnb">Airbnb</SelectItem>
                                            <SelectItem value="resort">Resort</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-base sm:text-lg"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? "Creating trip..." : "Create Trip & Generate Itinerary"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
