export const ACCOMMODATION_TYPES = [
  "Hotel",
  "Hostel",
  "Hostels",
  "Apartment",
  "Resort",
  "Homestay",
  "Villa",
  "Capsule",
  "Boutique",
  "Guesthouse",
] as const;

export const TRANSPORT_TYPES = [
  "Walk",
  "Taxi",
  "Train",
  "Bus",
  "Metro",
  "Tram",
  "Ferry",
  "Flight",
  "Bike",
  "Scooter",
  "public",
] as const;

export const ATTRACTION_CATEGORIES = [
  "Nature",
  "Monuments",
  "Museums",
  "Temples",
  "Cafes",
  "Markets",
  "Nightlife",
  "Adventure",
  "Art",
  "Shopping",
  "Food",
] as const;

export const INTERESTS = [
  "Food",
  "Art",
  "History",
  "Nature",
  "Nightlife",
  "Shopping",
  "Adventure",
  "Culture",
  "Relaxation",
  "Music",
  "Photography",
  "Architecture",
] as const;

export const CUISINES = [
  "Italian",
  "French",
  "Japanese",
  "Chinese",
  "Indian",
  "Mexican",
  "Thai",
  "Spanish",
  "Greek",
  "American",
  "Mediterranean",
  "Vietnamese",
  "Korean",
  "Turkish",
  "Middle Eastern",
  "Other",
] as const;

export type AccommodationType = typeof ACCOMMODATION_TYPES[number];
export type TransportType = typeof TRANSPORT_TYPES[number];
export type AttractionCategory = typeof ATTRACTION_CATEGORIES[number];
export type Interest = typeof INTERESTS[number];
export type Cuisine = typeof CUISINES[number];

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];
