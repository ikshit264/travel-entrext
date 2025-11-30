"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useTrip } from "@/hooks/useTrip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus, MapPin, Calendar, Plane, Trash2, Loader2,
    AlertCircle, CheckCircle2, Globe
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: userLoading, logout } = useUser();
    const { trips, loading: tripsLoading } = useTrip();
    const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
    const [tripToDelete, setTripToDelete] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push("/login");
        }
    }, [user, userLoading, router]);

    const handleDeleteClick = (e: React.MouseEvent, trip: any) => {
        e.stopPropagation();
        setTripToDelete(trip);
    };

    const handleDeleteConfirm = async () => {
        if (!tripToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/trip?tripId=${tripToDelete.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert("Failed to delete trip");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete trip");
        } finally {
            setDeleteLoading(false);
            setTripToDelete(null);
        }
    };

    if (userLoading || tripsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your trips...</p>
                </div>
            </div>
        );
    }

    const upcomingTrips = trips.filter((trip: any) => new Date(trip.startDate) >= new Date());
    const pastTrips = trips.filter((trip: any) => new Date(trip.startDate) < new Date());

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            {/* Responsive Navigation */}
            <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                TravelAI
                            </h1>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/profile")}
                                className="text-sm sm:text-base px-2 sm:px-4"
                            >
                                <span className="hidden sm:inline">Profile</span>
                                <span className="sm:hidden">👤</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={logout}
                                className="text-sm sm:text-base px-2 sm:px-4"
                            >
                                <span className="hidden sm:inline">Logout</span>
                                <span className="sm:hidden">🚪</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Responsive Main Container */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
                {/* Hero Section - Responsive */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex flex-col gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                                Welcome back, {user?.name}! 👋
                            </h2>
                            <p className="text-base sm:text-lg text-muted-foreground">
                                {trips.length === 0
                                    ? "Start planning your first AI-powered adventure"
                                    : `You have ${upcomingTrips.length} upcoming ${upcomingTrips.length === 1 ? 'trip' : 'trips'}`
                                }
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={() => router.push("/trip/new")}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            New Trip
                        </Button>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    {trips.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm opacity-90 mb-1">Total Trips</p>
                                            <p className="text-2xl sm:text-3xl font-bold">{trips.length}</p>
                                        </div>
                                        <Plane className="h-10 w-10 sm:h-12 sm:w-12 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm opacity-90 mb-1">Upcoming</p>
                                            <p className="text-2xl sm:text-3xl font-bold">{upcomingTrips.length}</p>
                                        </div>
                                        <Calendar className="h-10 w-10 sm:h-12 sm:w-12 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 sm:col-span-2 lg:col-span-1">
                                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm opacity-90 mb-1">Completed</p>
                                            <p className="text-2xl sm:text-3xl font-bold">{pastTrips.length}</p>
                                        </div>
                                        <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Trips Grid */}
                {trips.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm border-2 border-dashed">
                        <CardContent className="text-center py-16">
                            <div className="mb-6">
                                <div className="inline-block p-6 bg-primary/10 rounded-full mb-4">
                                    <MapPin className="h-16 w-16 text-primary" />
                                </div>
                                <h3 className="text-2xl font-semibold mb-2">No trips yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    Start planning your first AI-powered trip and let us create the perfect itinerary for you
                                </p>
                                <Button
                                    size="lg"
                                    onClick={() => router.push("/trip/new")}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Your First Trip
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Upcoming Trips */}
                        {upcomingTrips.length > 0 && (
                            <div className="mb-8 sm:mb-12">
                                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                    Upcoming Trips
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {upcomingTrips.map((trip: any) => (
                                        <TripCard
                                            key={trip.id}
                                            trip={trip}
                                            onDelete={handleDeleteClick}
                                            onClick={() => router.push(`/trip/${trip.id}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Trips */}
                        {pastTrips.length > 0 && (
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                    Past Trips
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {pastTrips.map((trip: any) => (
                                        <TripCard
                                            key={trip.id}
                                            trip={trip}
                                            onDelete={handleDeleteClick}
                                            onClick={() => router.push(`/trip/${trip.id}`)}
                                            isPast
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Delete Trip?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{tripToDelete?.title}</strong>?
                            This will permanently delete the trip, its itinerary, journal entries, and all related data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteLoading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Trip
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function TripCard({ trip, onDelete, onClick, isPast = false }: any) {
    const tripDuration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const hasItinerary = trip.itineraries && trip.itineraries.length > 0;

    return (
        <Card
            className={`group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-2 hover:border-primary/50 ${isPast ? 'opacity-75' : ''}`}
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                            {trip.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {trip.destinationCity}, {trip.country}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => onDelete(e, trip)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {hasItinerary && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        Itinerary Ready
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(trip.startDate)}</span>
                    <span>•</span>
                    <span>{tripDuration} {tripDuration === 1 ? 'day' : 'days'}</span>
                </div>

                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(trip.budget, trip.currency)}</p>
                </div>

                {trip.travelMode && (
                    <div className="flex items-center gap-2 text-sm">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize text-muted-foreground">{trip.travelMode}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
