"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Map, MapPin, Route, Navigation, Compass } from "lucide-react";

export default function MapPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.tripId as string;

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
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Responsive Hero Section */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="relative inline-block mb-6 sm:mb-8">
                            {/* Animated Background Circles - Responsive */}
                            <div className="absolute inset-0 -m-8 sm:-m-12">
                                <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-75"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 bg-indigo-400/20 rounded-full blur-2xl animate-pulse delay-150"></div>
                            </div>

                            {/* Main Icon - Responsive */}
                            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-8 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl shadow-2xl">
                                <Map className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 text-white animate-float" />

                                {/* Floating Icons - Responsive */}
                                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white p-2 sm:p-3 rounded-full shadow-lg animate-bounce-slow">
                                    <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                                <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white p-2 sm:p-3 rounded-full shadow-lg animate-bounce-slow delay-300">
                                    <Navigation className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                                </div>
                                <div className="absolute top-1/2 -right-4 sm:-right-6 bg-white p-2 sm:p-3 rounded-full shadow-lg animate-bounce-slow delay-500">
                                    <Route className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-4">
                            Interactive Map
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-2">Coming Soon</p>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                            We're building an amazing interactive map experience to help you visualize your journey
                        </p>
                    </div>

                    {/* Responsive Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <Card className="p-4 sm:p-6 bg-white/60 backdrop-blur-sm border-2 hover:border-blue-300 transition-all hover:shadow-xl group">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Route className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Route Visualization</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        See your entire journey mapped out with optimized routes between activities
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white/60 backdrop-blur-sm border-2 hover:border-purple-300 transition-all hover:shadow-xl group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                                    <MapPin className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">POI Markers</h3>
                                    <p className="text-sm text-muted-foreground">
                                        All your activities, restaurants, and attractions marked on the map
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white/60 backdrop-blur-sm border-2 hover:border-indigo-300 transition-all hover:shadow-xl group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-100 rounded-lg group-hover:scale-110 transition-transform">
                                    <Navigation className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Real-time Navigation</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Get turn-by-turn directions to your next destination
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white/60 backdrop-blur-sm border-2 hover:border-teal-300 transition-all hover:shadow-xl group">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-teal-100 rounded-lg group-hover:scale-110 transition-transform">
                                    <Compass className="h-6 w-6 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Explore Nearby</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Discover nearby attractions, restaurants, and hidden gems
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Responsive CTA Section */}
                    <Card className="p-6 sm:p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-blue-200/50 text-center">
                        <p className="text-base sm:text-lg text-muted-foreground mb-4">
                            We're working hard to bring you this feature. Stay tuned!
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </Card>
                </div>
            </main>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
                .delay-75 {
                    animation-delay: 0.75s;
                }
                .delay-150 {
                    animation-delay: 1.5s;
                }
                .delay-300 {
                    animation-delay: 0.3s;
                }
                .delay-500 {
                    animation-delay: 0.5s;
                }
            `}</style>
        </div>
    );
}
