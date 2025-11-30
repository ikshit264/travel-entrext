"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface CityResult {
    name: string;
    displayName: string;
    latitude: number;
    longitude: number;
    cityType: string;
    population?: number;
    externalId: string;
    state?: string;
    region?: string;
}

interface CitySelectorProps {
    country: string;
    value?: CityResult;
    onSelect: (city: CityResult) => void;
    disabled?: boolean;
}

export function CitySelector({ country, value, onSelect, disabled }: CitySelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<CityResult[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Simple debounce implementation
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2 && country) {
                searchCities(query);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, country]);

    const searchCities = async (searchQuery: string) => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/geo/city-search?city=${encodeURIComponent(searchQuery)}&country=${encodeURIComponent(country)}`
            );
            const data = await res.json();
            if (data.results) {
                setResults(data.results);
            }
        } catch (error) {
            console.error("Failed to search cities:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto py-3"
                    disabled={disabled || !country}
                >
                    {value ? (
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium">{value.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {value.state || value.region || value.displayName}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">
                            {country ? "Search for a city..." : "Select country first"}
                        </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <div className="flex items-center border-b px-3">
                    <Loader2 className={cn("mr-2 h-4 w-4 shrink-0 opacity-50", loading && "animate-spin")} />
                    <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type city name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {!loading && results.length === 0 && query.length >= 2 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No cities found.
                        </div>
                    )}
                    {!loading && query.length < 2 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search
                        </div>
                    )}
                    {results.map((city) => (
                        <div
                            key={city.externalId}
                            className="relative flex cursor-pointer select-none flex-col items-start rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                                onSelect(city);
                                setOpen(false);
                            }}
                        >
                            <div className="flex items-center w-full">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                <span className="font-medium">{city.name}</span>
                                {city.cityType && (
                                    <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-secondary rounded-full uppercase text-secondary-foreground">
                                        {city.cityType}
                                    </span>
                                )}
                            </div>
                            <div className="ml-6 text-xs text-muted-foreground">
                                {city.state ? `${city.state}, ` : ""}
                                {city.region ? `${city.region}, ` : ""}
                                {country}
                            </div>
                            {city.population && (
                                <div className="ml-6 text-[10px] text-muted-foreground mt-0.5">
                                    Pop: {city.population.toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
