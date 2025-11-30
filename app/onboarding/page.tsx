"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LocationSelector } from "@/components/inputs/LocationSelector";
import { SearchableSelect } from "@/components/inputs/SearchableSelect";
import { ACCOMMODATION_TYPES, TRANSPORT_TYPES } from "@/lib/constants";

export default function OnboardingPage() {
    const router = useRouter();
    const { updateUser } = useUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [apiKeyError, setApiKeyError] = useState("");
    const [formData, setFormData] = useState({
        geminiApiKey: "",
        homeCity: "",
        homeCountry: "",
        travelStyle: "balanced",
        budgetComfort: "mid",
        accommodationStyle: "",
        transportPreferences: "",
        emotionalBaseline: {},
    });

    const validateApiKey = () => {
        const key = formData.geminiApiKey.trim();
        if (!key) {
            setApiKeyError("API key is required");
            return false;
        }
        if (!/^AIza[A-Za-z0-9_-]{35}$/.test(key)) {
            setApiKeyError("Invalid Gemini API key format. It should start with 'AIza' and be 39 characters long.");
            return false;
        }
        setApiKeyError("");
        return true;
    };

    const handleNext = () => {
        // Validate API key on step 1
        if (step === 1 && !validateApiKey()) {
            return;
        }

        if (step < 4) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // We only send the fields expected by the API/Schema
            await updateUser(formData);
            router.push("/dashboard");
        } catch (error) {
            console.error("Onboarding failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const progress = (step / 4) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4">
                        <Progress value={progress} />
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">Step {step} of 4</p>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">Let's personalize your experience</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Help us understand your travel preferences</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Gemini API Key</Label>
                                <Input
                                    type="password"
                                    placeholder="AIza..."
                                    value={formData.geminiApiKey}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, geminiApiKey: e.target.value }));
                                        setApiKeyError("");
                                    }}
                                    className={apiKeyError ? "border-red-500" : ""}
                                />
                                {apiKeyError && (
                                    <p className="text-xs sm:text-sm text-red-600">{apiKeyError}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Get your free API key from{" "}
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Google AI Studio
                                    </a>
                                    . Your key is encrypted and stored securely.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Home City</Label>
                                <LocationSelector
                                    countryValue={formData.homeCountry}
                                    cityValue={formData.homeCity}
                                    onCountryChange={(country) => setFormData(prev => ({ ...prev, homeCountry: country }))}
                                    onCityChange={(city) => setFormData(prev => ({ ...prev, homeCity: city }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Travel Style</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                    {["relaxed", "balanced", "intense"].map((style) => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, travelStyle: style })}
                                            className={`p-3 sm:p-4 border-2 rounded-lg capitalize transition-all text-sm sm:text-base ${formData.travelStyle === style
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Budget Comfort</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                    {["low", "mid", "high"].map((budget) => (
                                        <button
                                            key={budget}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, budgetComfort: budget })}
                                            className={`p-3 sm:p-4 border-2 rounded-lg capitalize transition-all text-sm sm:text-base ${formData.budgetComfort === budget
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            {budget === "low" ? "Budget" : budget === "mid" ? "Moderate" : "Luxury"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Preferred Accommodation</Label>
                                <SearchableSelect
                                    options={ACCOMMODATION_TYPES.map(t => ({ label: t, value: t }))}
                                    value={formData.accommodationStyle}
                                    onChange={(val) => setFormData({ ...formData, accommodationStyle: val })}
                                    placeholder="Select accommodation style"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm sm:text-base">Transport Preferences</Label>
                                <SearchableSelect
                                    options={TRANSPORT_TYPES.map(t => ({ label: t, value: t }))}
                                    value={formData.transportPreferences}
                                    onChange={(val) => setFormData({ ...formData, transportPreferences: val })}
                                    placeholder="Select transport preference"
                                />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="text-center py-6 sm:py-8">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">All set!</h3>
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    We'll use these preferences to create personalized itineraries just for you.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                        {step > 1 && (
                            <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full sm:w-auto">
                                Back
                            </Button>
                        )}
                        <Button onClick={handleNext} disabled={loading} className="w-full sm:w-auto sm:ml-auto">
                            {step === 4 ? (loading ? "Saving..." : "Complete") : "Next"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
