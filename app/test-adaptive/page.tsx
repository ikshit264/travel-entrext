"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAdaptivePage() {
    const [tripId, setTripId] = useState("692adba4af32fe57a1da4531");
    const [dayPlanId, setDayPlanId] = useState("692adc09af32fe57a1da4533");
    const [city, setCity] = useState("London");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testWeather = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/weather", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tripId,
                    dayPlanId,
                    city,
                    date: new Date().toISOString(),
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const testMood = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tripId,
                    dayPlanId,
                    userId: "692ad9f7af32fe57a1da4525",
                    metrics: {
                        typingSpeed: 0,
                        scrollVelocity: 2500, // Trigger "overwhelmed"
                        rageClicks: 5, // Trigger "frustrated"
                        backspaceCount: 0,
                    },
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold">Adaptive Engine Test Console</h1>
            
            <Card>
                <CardHeader><CardTitle>Context</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="Trip ID" value={tripId} onChange={e => setTripId(e.target.value)} />
                    <Input placeholder="DayPlan ID" value={dayPlanId} onChange={e => setDayPlanId(e.target.value)} />
                    <Input placeholder="City (for Weather)" value={city} onChange={e => setCity(e.target.value)} />
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button onClick={testWeather} disabled={loading}>Test Weather (Real API)</Button>
                <Button onClick={testMood} disabled={loading}>Test Mood (Simulated Frustration)</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                <CardContent>
                    <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-96 text-xs">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
