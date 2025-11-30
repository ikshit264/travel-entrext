"use client";

import { useEffect, useState } from "react";
import { Trip } from "@/utils/types";

export function useTrip(tripId?: string) {
  const [trip, setTrip] = useState<any | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId);
    } else {
      fetchTrips();
    }
  }, [tripId]);

  const fetchTrip = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trip?tripId=${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch trip");
      }

      const data = await response.json();
      setTrip(data.trip);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/trip");
      
      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }

      const data = await response.json();
      setTrips(data.trips);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: any) => {
    try {
      const response = await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || "Failed to create trip";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.trip;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const response = await fetch(`/api/trip?tripId=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }

      setTrips(trips.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const generateItinerary = async (id: string) => {
    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const data = await response.json();
      return data.itinerary;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    trip,
    trips,
    loading,
    error,
    createTrip,
    deleteTrip,
    generateItinerary,
    refetch: tripId ? () => fetchTrip(tripId) : fetchTrips,
  };
}
