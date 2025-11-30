
import { getForecast } from "@/lib/weather";

async function testWeather() {
  try {
    console.log("Testing weather API...");
    const city = "London";
    const forecast = await getForecast(city);
    console.log(`Forecast for ${city}:`, forecast.length > 0 ? "Success" : "Failed (Empty)");
    if (forecast.length > 0) {
      console.log("First item:", forecast[0]);
    }
  } catch (error) {
    console.error("Weather API Test Error:", error);
  }
}

testWeather();
