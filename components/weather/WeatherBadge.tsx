import { WeatherData, WeatherCondition } from "@/lib/weather";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from "lucide-react";

interface WeatherBadgeProps {
    weather: WeatherData;
    className?: string;
    minimal?: boolean;
}

export function WeatherBadge({ weather, className, minimal = false }: WeatherBadgeProps) {
    const { condition, temperature, description } = weather;

    const getIcon = (condition: WeatherCondition) => {
        switch (condition) {
            case "Clear": return <Sun className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-yellow-500`} />;
            case "Clouds": return <Cloud className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-gray-500`} />;
            case "Rain": return <CloudRain className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-blue-500`} />;
            case "Drizzle": return <CloudDrizzle className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-blue-400`} />;
            case "Thunderstorm": return <CloudLightning className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-purple-500`} />;
            case "Snow": return <CloudSnow className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-cyan-500`} />;
            case "Mist":
            case "Fog":
            case "Haze": return <CloudFog className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-gray-400`} />;
            default: return <Sun className={`${minimal ? "h-3 w-3" : "h-4 w-4"} text-yellow-500`} />;
        }
    };

    if (minimal) {
        return (
            <div className={`flex flex-col items-center justify-center ${className}`} title={`${Math.round(temperature)}°C ${description}`}>
                {getIcon(condition)}
                <span className="text-[10px] font-bold text-slate-700 leading-none mt-0.5">{Math.round(temperature)}°</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border shadow-sm ${className}`}>
            {getIcon(condition)}
            <div className="flex flex-col leading-none">
                <span className="text-xs font-bold text-slate-700">{Math.round(temperature)}°C</span>
                <span className="text-[10px] text-slate-500 capitalize">{description}</span>
            </div>
        </div>
    );
}
