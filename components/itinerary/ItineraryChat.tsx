"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X } from "lucide-react";

interface ItineraryChatProps {
    tripId: string;
    onUpdate: () => void;
}

export function ItineraryChat({ tripId, onUpdate }: ItineraryChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);

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
                body: JSON.stringify({ tripId, message: userMsg }),
            });

            const data = await res.json();

            if (data.success) {
                setHistory(prev => [...prev, { role: "ai", text: "I've updated your itinerary based on your request!" }]);
                onUpdate(); // Refresh parent
            } else {
                setHistory(prev => [...prev, { role: "ai", text: data.message || "Sorry, I couldn't process that request." }]);
            }
        } catch (err) {
            setHistory(prev => [...prev, { role: "ai", text: "Something went wrong. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full h-14 w-14 shadow-xl bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-80 shadow-2xl border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between p-4 bg-blue-50 rounded-t-lg">
                        <CardTitle className="text-sm font-medium text-blue-900">Trip Assistant</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white">
                            {history.length === 0 && (
                                <p className="text-xs text-gray-400 text-center mt-4">
                                    Ask me to change plans, find restaurants, or adjust for weather!
                                </p>
                            )}
                            {history.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] rounded-lg p-2 text-xs ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && <div className="text-xs text-gray-400 animate-pulse">Thinking...</div>}
                        </div>
                        <div className="p-3 border-t flex gap-2">
                            <Input
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="e.g. Change day 2 to indoor..."
                                className="text-xs h-8"
                                onKeyDown={e => e.key === "Enter" && handleSend()}
                            />
                            <Button size="icon" className="h-8 w-8" onClick={handleSend} disabled={loading}>
                                <Send className="h-3 w-3" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
