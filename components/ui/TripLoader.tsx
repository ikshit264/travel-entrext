"use client";

import { useState, useEffect } from "react";
import { Plane, Map, Sun, Hotel, Coffee, Camera, Compass, Luggage } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LOADING_STEPS = [
    { icon: Map, text: "Analyzing destination..." },
    { icon: Sun, text: "Checking weather patterns..." },
    { icon: Hotel, text: "Finding best places to stay..." },
    { icon: Coffee, text: "Curating local experiences..." },
    { icon: Luggage, text: "Packing your itinerary..." },
    { icon: Plane, text: "Finalizing your trip..." },
];

const TRAVEL_QUOTES = [
    "Not all those who wander are lost.",
    "The world is a book and those who do not travel read only one page.",
    "Life is either a daring adventure or nothing at all.",
    "Take only memories, leave only footprints.",
    "Adventure is worthwhile.",
    "Travel is the only thing you buy that makes you richer.",
    "To travel is to live.",
];

export function TripLoader() {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        // Progress animation - 15 seconds total duration roughly
        const duration = 15000;
        const intervalTime = 100;
        const steps = duration / intervalTime;
        const increment = 100 / steps;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return 95; // Stall at 95% until actually done
                return prev + increment;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Step animation based on progress
        const stepDuration = 95 / LOADING_STEPS.length;
        const step = Math.min(
            Math.floor(progress / stepDuration),
            LOADING_STEPS.length - 1
        );
        setCurrentStep(step);
    }, [progress]);

    useEffect(() => {
        // Rotate quotes every 3 seconds
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % TRAVEL_QUOTES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = LOADING_STEPS[currentStep].icon;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg transition-all duration-500">
            <div className="w-full max-w-md p-8 space-y-12 text-center">

                {/* Animated Icon Container */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />

                    {/* Inner pulsing ring */}
                    <div className="absolute inset-2 border-4 border-primary/10 rounded-full animate-ping" />

                    {/* Icon Background */}
                    <div className="bg-white p-6 rounded-full shadow-2xl border border-primary/10 relative z-10 transform transition-all duration-500 hover:scale-105">
                        <CurrentIcon className="w-12 h-12 text-primary animate-bounce duration-1000" />
                    </div>
                </div>

                {/* Text Status */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 animate-pulse transition-all duration-300">
                        {LOADING_STEPS[currentStep].text}
                    </h3>
                    <div className="h-12 flex items-center justify-center">
                        <p className="text-gray-500 italic text-sm transition-opacity duration-500 px-4">
                            "{TRAVEL_QUOTES[quoteIndex]}"
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3 max-w-xs mx-auto">
                    <Progress value={progress} className="h-2 bg-primary/10" />
                    <div className="flex justify-between text-xs font-medium text-gray-400">
                        <span>{Math.round(progress)}%</span>
                        <span>Generating Magic...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
