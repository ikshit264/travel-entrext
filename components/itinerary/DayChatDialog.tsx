"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Loader2 } from "lucide-react";

import { ItineraryDiffModal } from "./ItineraryDiffModal";

interface DayChatDialogProps {
    tripId: string;
    dayPlanId: string;
    dayIndex: number;
    currentActivities: any[]; // Pass current activities
    onUpdate: () => void;
}

export function DayChatDialog({ tripId, dayPlanId, dayIndex, currentActivities, onUpdate }: DayChatDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);

    // Diff Modal State
    const [showDiff, setShowDiff] = useState(false);
    const [proposedActivities, setProposedActivities] = useState<any[]>([]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = message;
        setMessage("");
        setHistory(prev => [...prev, { role: "user", text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch("/api/itinerary/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tripId, dayPlanId, message: userMsg }),
            });

            const data = await res.json();

            if (data.success) {
                setHistory(prev => [...prev, { role: "ai", text: "I've generated a new plan. Please review the changes." }]);
                setProposedActivities(data.updatedPlan);
                setIsOpen(false); // Close chat dialog
                setShowDiff(true); // Open diff modal
            } else {
                setHistory(prev => [...prev, { role: "ai", text: data.message || "Sorry, I couldn't process that request." }]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDiff = async (finalActivities: any[]) => {
        try {
            const res = await fetch(`/api/itinerary/day/${dayPlanId}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activities: finalActivities }),
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Save failed:", err);
                return;
            }

            onUpdate();
            setIsOpen(false);
            setShowDiff(false);
        } catch (error) {
            console.error("Failed to save merged plan", error);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Edit with AI
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Day {dayIndex}</DialogTitle>
                    </DialogHeader>
                    <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-slate-50 rounded-md border">
                        {history.length === 0 && (
                            <p className="text-sm text-gray-500 text-center mt-10">
                                Ask me to change specific activities, times, or the entire vibe of Day {dayIndex}.
                            </p>
                        )}
                        {history.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border text-gray-800"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-center p-2">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Input
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="e.g. Start later, add a museum..."
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                        />
                        <Button size="icon" onClick={handleSend} disabled={loading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            <ItineraryDiffModal
                isOpen={showDiff}
                onClose={() => setShowDiff(false)}
                originalActivities={currentActivities}
                newActivities={proposedActivities}
                onSave={handleSaveDiff}
            />
        </>
    );
}
