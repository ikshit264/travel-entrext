
"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check, X, RefreshCw, AlertCircle, ArrowLeftRight, ChevronDown, ChevronUp } from "lucide-react";
import { calculateItineraryDiff, DiffRow } from "@/lib/utils/diff-adapter";
import { cn } from "@/lib/utils";

interface Activity {
    id?: string;
    title: string;
    description: string;
    time: string;
    duration: string;
    estimatedCost: number;
    location?: { name: string };
    category?: string;
}

interface ItineraryDiffModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalActivities: Activity[];
    newActivities: Activity[];
    onSave: (finalActivities: Activity[]) => Promise<void>;
}

export function ItineraryDiffModal({ isOpen, onClose, originalActivities, newActivities, onSave }: ItineraryDiffModalProps) {
    const [saving, setSaving] = useState(false);

    // State to track user decisions for each time slot
    // key: time, value: 'original' | 'new' | 'none'
    const [decisions, setDecisions] = useState<Record<string, 'original' | 'new' | 'none'>>({});

    // State to track expanded descriptions
    // key: `${time}-${side}` (e.g., "09:00-original" or "09:00-new"), value: boolean
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

    // Calculate diff once when modal opens or inputs change
    const diffRows = useMemo(() => {
        return calculateItineraryDiff(originalActivities, newActivities);
    }, [originalActivities, newActivities]);

    // Initialize decisions based on diff status
    useEffect(() => {
        if (isOpen) {
            const initialDecisions: Record<string, 'original' | 'new' | 'none'> = {};
            diffRows.forEach(row => {
                if (row.status === 'added') {
                    initialDecisions[row.time] = 'new'; // Default: Accept new
                } else if (row.status === 'removed') {
                    initialDecisions[row.time] = 'none'; // Default: Accept removal (don't keep original)
                } else if (row.status === 'modified') {
                    initialDecisions[row.time] = 'new'; // Default: Accept change
                } else {
                    initialDecisions[row.time] = 'original'; // Unchanged, keep original (doesn't matter really)
                }
            });
            setDecisions(initialDecisions);
            setExpandedDescriptions({}); // Reset expanded state when modal opens
        }
    }, [isOpen, diffRows]);

    const handleDecision = (time: string, choice: 'original' | 'new' | 'none') => {
        setDecisions(prev => ({ ...prev, [time]: choice }));
    };

    const toggleDescription = (time: string, side: 'original' | 'new') => {
        const key = `${time}-${side}`;
        setExpandedDescriptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        const finalActivities: Activity[] = [];

        diffRows.forEach(row => {
            const decision = decisions[row.time];
            if (decision === 'original' && row.original) {
                finalActivities.push(row.original);
            } else if (decision === 'new' && row.new) {
                finalActivities.push(row.new);
            }
        });

        // Sort just in case
        finalActivities.sort((a, b) => a.time.localeCompare(b.time));

        await onSave(finalActivities);
        setSaving(false);
        onClose();
    };

    // Helper function to render description with See more/See less
    const renderDescription = (description: string, time: string, side: 'original' | 'new') => {
        const key = `${time}-${side}`;
        const isExpanded = expandedDescriptions[key];
        const maxLength = 80; // Character limit before truncation
        const shouldTruncate = description.length > maxLength;

        if (!shouldTruncate) {
            return <p className="text-xs text-slate-500">{description}</p>;
        }

        return (
            <div>
                <p className="text-xs text-slate-500">
                    {isExpanded ? description : `${description.substring(0, maxLength)}...`}
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(time, side);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 flex items-center gap-1"
                >
                    {isExpanded ? (
                        <>
                            See less <ChevronUp className="h-3 w-3" />
                        </>
                    ) : (
                        <>
                            See more <ChevronDown className="h-3 w-3" />
                        </>
                    )}
                </button>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b bg-white z-10">
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        <span className="truncate">Review Itinerary Changes</span>
                    </DialogTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Compare the current plan with the AI's suggestions. Select which version to keep for each time slot.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-100 border border-green-500"></span>
                            <span className="text-muted-foreground">Added</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-100 border border-red-500"></span>
                            <span className="text-muted-foreground">Removed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-100 border border-blue-500"></span>
                            <span className="text-muted-foreground">Modified</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                    <div className="w-full">
                        {/* Header Row - Hidden on mobile, visible on desktop */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b bg-slate-100 text-sm font-semibold text-slate-500 sticky top-0 z-10 shadow-sm">
                            <div className="col-span-1 text-center">Time</div>
                            <div className="col-span-5 pl-2">Current Plan</div>
                            <div className="col-span-1 text-center">Action</div>
                            <div className="col-span-5 pl-2">Proposed Plan</div>
                        </div>

                        {/* Diff Rows - Responsive */}
                        <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
                            {diffRows.map((row) => {
                                const decision = decisions[row.time];
                                const isModified = row.status === 'modified';
                                const isAdded = row.status === 'added';
                                const isRemoved = row.status === 'removed';
                                const isUnchanged = row.status === 'unchanged';

                                return (
                                    <div key={row.time} className={cn(
                                        "rounded-lg border p-2 sm:p-1 transition-colors",
                                        isModified && "bg-blue-50/30 border-blue-200",
                                        isAdded && "bg-green-50/30 border-green-200",
                                        isRemoved && "bg-red-50/30 border-red-200",
                                        isUnchanged && "bg-white border-slate-100 opacity-80"
                                    )}>
                                        {/* Mobile Layout */}
                                        <div className="lg:hidden space-y-3">
                                            {/* Time Header */}
                                            <div className="flex items-center justify-between pb-2 border-b border-dashed">
                                                <span className="font-bold text-slate-600 text-sm">{row.time}</span>
                                                {isAdded && <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded uppercase">Added</span>}
                                                {isRemoved && <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded uppercase">Removed</span>}
                                                {isModified && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">Modified</span>}
                                            </div>

                                            {/* Current Plan */}
                                            {row.original && (
                                                <div className={cn(
                                                    "p-3 rounded-md border transition-all",
                                                    decision === 'original' ? "bg-white border-slate-300 shadow-sm" : "opacity-50 bg-slate-50"
                                                )}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase">Current</span>
                                                        {!isUnchanged && (
                                                            <Checkbox
                                                                checked={decision === 'original'}
                                                                onCheckedChange={(checked) => handleDecision(row.time, checked ? 'original' : (isRemoved ? 'none' : 'new'))}
                                                                className="data-[state=checked]:bg-slate-600"
                                                            />
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold text-sm text-slate-800 mb-1">{row.original.title}</h4>
                                                    {renderDescription(row.original.description, row.time, 'original')}
                                                    <div className="mt-2 text-xs text-slate-400">{row.original.category}</div>
                                                </div>
                                            )}

                                            {/* Proposed Plan */}
                                            {row.new && (
                                                <div className={cn(
                                                    "p-3 rounded-md border transition-all",
                                                    decision === 'new' ? "bg-white border-blue-400 shadow-sm" : "opacity-50 bg-slate-50"
                                                )}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold text-blue-600 uppercase">Proposed</span>
                                                        {!isUnchanged && (
                                                            <Checkbox
                                                                checked={decision === 'new'}
                                                                onCheckedChange={(checked) => handleDecision(row.time, checked ? 'new' : (isAdded ? 'none' : 'original'))}
                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                            />
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold text-sm text-slate-800 mb-1">{row.new.title}</h4>
                                                    {renderDescription(row.new.description, row.time, 'new')}
                                                    <div className="mt-2 text-xs text-slate-400">{row.new.category}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden lg:grid grid-cols-12 gap-4 items-stretch">
                                            {/* Time */}
                                            <div className="col-span-1 flex items-center justify-center font-bold text-slate-500 text-sm border-r border-dashed border-slate-200">
                                                {row.time}
                                            </div>

                                            {/* Original Side */}
                                            <div className={cn("col-span-5 p-3 rounded-md transition-all",
                                                decision === 'original' ? "bg-white shadow-sm ring-1 ring-slate-300" : "opacity-50 grayscale-[0.5]"
                                            )}>
                                                {row.original ? (
                                                    <div onClick={() => !isUnchanged && handleDecision(row.time, 'original')} className={cn("cursor-pointer h-full", isUnchanged && "cursor-default")}>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold text-slate-800">{row.original.title}</h4>
                                                            {isRemoved && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded uppercase">Removed</span>}
                                                        </div>
                                                        {renderDescription(row.original.description, row.time, 'original')}
                                                        <div className="mt-2 text-xs text-slate-400">{row.original.category}</div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
                                                        Empty slot
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Column */}
                                            <div className="col-span-1 flex flex-col items-center justify-center gap-2">
                                                {isModified && (
                                                    <ArrowRight className="h-5 w-5 text-blue-400" />
                                                )}
                                                {isAdded && (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-bold text-green-600 mb-1">ADD</span>
                                                        <Checkbox
                                                            checked={decision === 'new'}
                                                            onCheckedChange={(checked) => handleDecision(row.time, checked ? 'new' : 'none')}
                                                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                        />
                                                    </div>
                                                )}
                                                {isRemoved && (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-bold text-red-600 mb-1">KEEP</span>
                                                        <Checkbox
                                                            checked={decision === 'original'}
                                                            onCheckedChange={(checked) => handleDecision(row.time, checked ? 'original' : 'none')}
                                                            className="data-[state=checked]:bg-slate-600"
                                                        />
                                                    </div>
                                                )}
                                                {isUnchanged && (
                                                    <div className="w-1 h-full bg-slate-200 rounded-full"></div>
                                                )}
                                            </div>

                                            {/* New Side */}
                                            <div className={cn("col-span-5 p-3 rounded-md transition-all",
                                                decision === 'new' ? "bg-white shadow-sm ring-1 ring-blue-400" : "opacity-50 grayscale-[0.5]"
                                            )}>
                                                {row.new ? (
                                                    <div onClick={() => !isUnchanged && handleDecision(row.time, 'new')} className={cn("cursor-pointer h-full", isUnchanged && "cursor-default")}>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold text-slate-800">{row.new.title}</h4>
                                                            {isAdded && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded uppercase">New</span>}
                                                            {isModified && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">Updated</span>}
                                                        </div>
                                                        {renderDescription(row.new.description, row.time, 'new')}
                                                        <div className="mt-2 text-xs text-slate-400">{row.new.category}</div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
                                                        --
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-3 sm:p-4 bg-white border-t flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 z-10">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                        Reviewing <span className="font-medium text-slate-900">{diffRows.length}</span> time slots
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none sm:min-w-[150px]">
                            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Apply Changes
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
