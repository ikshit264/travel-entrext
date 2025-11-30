"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, Edit } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading } = useUser();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl">
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Profile</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">Your travel preferences and insights</p>
                    </div>
                    <Button
                        onClick={() => router.push("/profile/edit")}
                        className="w-full sm:w-auto"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>

                {/* Responsive Cards */}
                <div className="space-y-4 sm:space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Name</p>
                                <p className="font-medium text-sm sm:text-base">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                                <p className="font-medium text-sm sm:text-base break-all">{user?.email}</p>
                            </div>
                            {user?.homeCity && (
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Home City</p>
                                    <p className="font-medium text-sm sm:text-base">{user.homeCity}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl">Travel Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                            {user?.travelStyle && (
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Travel Style</p>
                                    <p className="font-medium text-sm sm:text-base capitalize">{user.travelStyle}</p>
                                </div>
                            )}
                            {user?.budgetComfort && (
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Budget Comfort</p>
                                    <p className="font-medium text-sm sm:text-base capitalize">{user.budgetComfort}</p>
                                </div>
                            )}
                            {user?.accommodationStyle && (
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Accommodation</p>
                                    <p className="font-medium text-sm sm:text-base">{user.accommodationStyle}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
