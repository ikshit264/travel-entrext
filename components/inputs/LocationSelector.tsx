"use client";

import * as React from "react";
import { SearchableSelect } from "./SearchableSelect";
import { getCountries, getCities } from "@/lib/external-api";
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
    countryValue?: string;
    cityValue?: string;
    onCountryChange: (country: string) => void;
    onCityChange: (city: string) => void;
    disabled?: boolean;
    disabledCity?: boolean;
}

export function LocationSelector({
    countryValue,
    cityValue,
    onCountryChange,
    onCityChange,
    disabled = false,
    disabledCity = false,
}: LocationSelectorProps) {
    const [countries, setCountries] = React.useState<{ label: string; value: string }[]>([]);
    const [cities, setCities] = React.useState<{ label: string; value: string }[]>([]);
    const [loadingCountries, setLoadingCountries] = React.useState(false);
    const [loadingCities, setLoadingCities] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        const loadCountries = async () => {
            setLoadingCountries(true);
            try {
                const data = await getCountries();
                if (mounted) {
                    if (data && data.length > 0) {
                        setCountries(
                            data.map((c) => ({
                                label: c.name,
                                value: c.name,
                            }))
                        );
                    } else {
                        throw new Error("No countries found");
                    }
                }
            } catch (error) {
                console.error("Failed to load countries", error);
                // Fallback to common countries if API fails
                if (mounted) {
                    setCountries([
                        { label: "United States", value: "United States" },
                        { label: "United Kingdom", value: "United Kingdom" },
                        { label: "Canada", value: "Canada" },
                        { label: "Australia", value: "Australia" },
                        { label: "India", value: "India" },
                        { label: "France", value: "France" },
                        { label: "Germany", value: "Germany" },
                        { label: "Japan", value: "Japan" },
                        { label: "Italy", value: "Italy" },
                        { label: "Spain", value: "Spain" },
                        { label: "Brazil", value: "Brazil" },
                        { label: "Mexico", value: "Mexico" },
                    ]);
                }
            } finally {
                if (mounted) setLoadingCountries(false);
            }
        };
        loadCountries();
        return () => {
            mounted = false;
        };
    }, []);

    React.useEffect(() => {
        let mounted = true;
        const loadCities = async () => {
            if (!countryValue) {
                setCities([]);
                return;
            }
            setLoadingCities(true);
            try {
                const data = await getCities(countryValue);
                if (mounted) {
                    if (data && data.length > 0) {
                        setCities(
                            data.map((city) => ({
                                label: city,
                                value: city,
                            }))
                        );
                    } else {
                        // If no cities found for this country, or API failed
                        setCities([]);
                    }
                }
            } catch (error) {
                console.error("Failed to load cities", error);
            } finally {
                if (mounted) setLoadingCities(false);
            }
        };
        loadCities();
        return () => {
            mounted = false;
        };
    }, [countryValue]);

    const handleCountryChange = (value: string) => {
        onCountryChange(value);
        onCityChange(""); // Reset city when country changes
    };

    return (
        <div className={`grid gap-4 ${disabledCity ? "grid-cols-1" : "grid-cols-2"}`}>
            <div className="space-y-2">
                <Label>Country</Label>
                <SearchableSelect
                    options={countries}
                    value={countryValue}
                    onChange={handleCountryChange}
                    placeholder={loadingCountries ? "Loading countries..." : "Select country"}
                    searchPlaceholder="Search country..."
                    disabled={disabled || loadingCountries}
                />
            </div>
            {!disabledCity && (
                <div className="space-y-2">
                    <Label>City</Label>
                    <SearchableSelect
                        options={cities}
                        value={cityValue}
                        onChange={onCityChange}
                        placeholder={!countryValue ? "Select country first" : loadingCities ? "Loading cities..." : "Select city"}
                        searchPlaceholder="Search city..."
                        disabled={disabled || !countryValue || loadingCities}
                        emptyMessage={!countryValue ? "Please select a country first." : "No cities found."}
                    />
                </div>
            )}
        </div>
    );
}
