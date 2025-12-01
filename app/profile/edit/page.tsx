"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationSelector } from "@/components/inputs/LocationSelector";
import { SearchableSelect } from "@/components/inputs/SearchableSelect";
import { ACCOMMODATION_TYPES, TRANSPORT_TYPES } from "@/lib/constants";
import { Save, User as UserIcon, MapPin, Briefcase, Key } from "lucide-react";

function EditProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading, updateUser } = useUser();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [apiKeyError, setApiKeyError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        geminiApiKey: "",
        homeCity: "",
        homeCountry: "",
        travelStyle: "balanced",
        budgetComfort: "mid",
        accommodationStyle: "",
        transportPreferences: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                geminiApiKey: user.hasApiKey ? "••••••••••••••••" : "",
                homeCity: user.homeCity || "",
                homeCountry: user.homeCountry || "",
                travelStyle: user.travelStyle || "balanced",
                budgetComfort: user.budgetComfort || "mid",
                accommodationStyle: user.accommodationStyle || "",
                transportPreferences: user.transportPreferences || "",
            });
        }
    }, [user]);

    // Check for error message from middleware redirect
    useEffect(() => {
        const error = searchParams.get("error");
        const errorMessage = searchParams.get("message");

        if (error === "api_key_required" && errorMessage) {
            setMessage({
                type: "error",
                text: errorMessage + " - Please enter your API key below to continue."
            });
        }
    }, [searchParams]);

    const validateApiKey = (key: string) => {
        if (!key) return true; // Empty is okay (means no update)
        if (key === "••••••••••••••••") return true; // Placeholder is okay
        if (!/^AIza[A-Za-z0-9_-]{35}$/.test(key)) {
            setApiKeyError("Invalid Gemini API key format. It should start with 'AIza' and be 39 characters long.");
            return false;
        }
        setApiKeyError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate API key if provided
        if (formData.geminiApiKey && !validateApiKey(formData.geminiApiKey)) {
            return;
        }

        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            // Only send geminiApiKey if it's not empty
            const dataToUpdate = {
                name: formData.name,
                homeCity: formData.homeCity,
                homeCountry: formData.homeCountry,
                travelStyle: formData.travelStyle,
                budgetComfort: formData.budgetComfort,
                accommodationStyle: formData.accommodationStyle,
                transportPreferences: formData.transportPreferences,

                ...(formData.geminiApiKey && formData.geminiApiKey !== "••••••••••••••••" && { geminiApiKey: formData.geminiApiKey }),
            };

            await updateUser(dataToUpdate);
            setMessage({ type: "success", text: "Profile updated successfully!" });

            // Clear API key field after successful update
            setFormData(prev => ({ ...prev, geminiApiKey: "" }));

            // Redirect back to profile after 2 seconds
            setTimeout(() => {
                router.push("/profile");
            }, 2000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <nav className="border-b bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/profile")}
                        className="text-sm sm:text-base"
                    >
                        ← Back to Profile
                    </Button>
                </div>
            </nav>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Edit Profile</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Update your personal information and travel preferences
                    </p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Email cannot be changed: <span className="font-medium text-foreground">{user?.email}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your name"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* API Key */}
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg sm:text-xl">Gemini API Key</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Update your Gemini API key (leave empty to keep current)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="apiKey">API Key</Label>
                                <Input
                                    id="apiKey"
                                    type="password"
                                    value={formData.geminiApiKey}
                                    onChange={(e) => {
                                        setFormData({ ...formData, geminiApiKey: e.target.value });
                                        setApiKeyError("");
                                    }}
                                    placeholder="AIza..."
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
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Travel Preferences */}
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg sm:text-xl">Travel Preferences</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Travel Style</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["relaxed", "balanced", "intense"].map((style) => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, travelStyle: style })}
                                            className={`p-3 border-2 rounded-lg capitalize transition-all text-sm ${formData.travelStyle === style
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Budget Comfort</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["low", "mid", "high"].map((budget) => (
                                        <button
                                            key={budget}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, budgetComfort: budget })}
                                            className={`p-3 border-2 rounded-lg capitalize transition-all text-sm ${formData.budgetComfort === budget
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
                                <Label>Preferred Accommodation</Label>
                                <SearchableSelect
                                    options={ACCOMMODATION_TYPES.map(t => ({ label: t, value: t }))}
                                    value={formData.accommodationStyle}
                                    onChange={(val) => setFormData({ ...formData, accommodationStyle: val })}
                                    placeholder="Select accommodation style"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Transport Preferences</Label>
                                <SearchableSelect
                                    options={TRANSPORT_TYPES.map(t => ({ label: t, value: t }))}
                                    value={formData.transportPreferences}
                                    onChange={(val) => setFormData({ ...formData, transportPreferences: val })}
                                    placeholder="Select transport preference"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/profile")}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function EditProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <EditProfileContent />
        </Suspense>
    );
}
