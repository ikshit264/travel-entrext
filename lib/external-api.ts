// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  if (cache[key] && now - cache[key].timestamp < CACHE_TTL) {
    return cache[key].data as T;
  }

  const data = await fetcher();
  cache[key] = { data, timestamp: now };
  return data;
}

export interface Country {
  name: string;
  code: string;
  flag: string;
}

export interface City {
  name: string;
  country: string;
}

export async function getCountries(): Promise<Country[]> {
  return fetchWithCache("countries", async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags");
      if (!response.ok) throw new Error("Failed to fetch countries");
      const data = await response.json();
      
      return data.map((item: any) => ({
        name: item.name.common,
        code: item.cca2,
        flag: item.flags.svg,
      })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  });
}

export async function getCities(country: string): Promise<string[]> {
  return fetchWithCache(`cities-${country}`, async () => {
    try {
      const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ country }),
      });

      if (!response.ok) {
        // Fallback or handle error gracefully
        console.warn(`Failed to fetch cities for ${country}`);
        return [];
      }

      const data = await response.json();
      if (data.error) return [];
      
      return data.data;
    } catch (error) {
      console.error(`Error fetching cities for ${country}:`, error);
      return [];
    }
  });
}
