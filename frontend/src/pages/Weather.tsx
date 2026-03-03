import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import VoiceInput from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, Eye, Bell } from "lucide-react";
import weatherImage from "@/assets/weather-monitoring.jpg";
import { useLanguage } from "@/contexts/LanguageContext"; // add import

const Weather = () => {
  const { t } = useLanguage(); // add hook
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchGeminiWeather = async (lat?: number, lng?: number) => {
      setLoading(true);
      try {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Prepare prompt for Gemini
        const prompt = `
Given the following location (latitude and longitude) and today's date, provide a 5-day weather forecast as a JSON array. Each object must include: "date", "day", "high", "low", "condition", and "rainPercent" (rain probability as a percentage, always include this field even if 0). Respond ONLY with JSON.

Location:
{
  "lat": ${lat || null},
  "lon": ${lng || null}
}
Current Date: "${todayStr}"
        `.trim();

        // Call Gemini 2.0 Flash API directly
        const geminiRes = await fetch(
          "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyAtWVmkc7b08-o2JBlPTzJkVrbZA3ryf9E",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: prompt }]
              }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
            })
          }
        );
        console.log("Gemini API response status:", geminiRes);
        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          let text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
          // Try to extract JSON from code block if present
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (jsonMatch) {
            text = jsonMatch[1];
          }
          let parsed = null;
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = null;
          }
          setWeatherData(parsed);
        } else {
          setWeatherData(null);
        }
      } catch {
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchGeminiWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchGeminiWeather();
        }
      );
    } else {
      fetchGeminiWeather();
    }
  }, []);

  const farmingAdvice = [
    {
      icon: <CloudRain className="h-5 w-5 text-blue-500" />,
      title: t("weather.rainExpectedTomorrow"),
      description: t("weather.rainExpectedTomorrowDesc"),
      priority: "high"
    },
    {
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      title: t("weather.perfectForHarvesting"),
      description: t("weather.perfectForHarvestingDesc"),
      priority: "medium"
    },
    {
      icon: <Wind className="h-5 w-5 text-gray-500" />,
      title: t("weather.windAlert"),
      description: t("weather.windAlertDesc"),
      priority: "low"
    }
  ];

  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny": return <Sun className="h-6 w-6 text-yellow-500" />;
      case "rainy": return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "cloudy": return <Cloud className="h-6 w-6 text-gray-500" />;
      case "partly cloudy": return <Cloud className="h-6 w-6 text-gray-400" />;
      default: return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-200 bg-red-50";
      case "medium": return "border-yellow-200 bg-yellow-50";
      case "low": return "border-blue-200 bg-blue-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">{t("weather.title")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("weather.subtitle")}
          </p>
        </div>

        <div className="w-full mb-8">
          <Card className="w-full animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-accent" />
                {t("weather.currentWeather")}
              </CardTitle>
              <CardDescription>
                {loading
                  ? t("weather.loadingLocation")
                  : weatherData?.location || ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <p className="text-muted-foreground">{t("weather.fetchingWeatherData")}</p>
                </div>
              ) : weatherData ? (
                <>
                  <h4 className="font-semibold mb-4">{t("weather.fiveDayForecast")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {weatherData.map((day: any, index: number) => (
                      <div key={index} className="p-3 bg-secondary rounded-lg text-center">
                        <div className="text-sm font-medium mb-2">{day.day || day.date}</div>
                        {/* You may want to parse condition for icon */}
                        <div className="text-2xl mb-1">{t(day.condition)}</div>
                        <div className="text-sm mt-2">
                          <div className="font-semibold">{day.high}°</div>
                          <div className="text-muted-foreground">{day.low}°</div>
                        </div>
                        <div className="text-xs text-blue-500 mt-1">{day.rainPercent}% {t("weather.rain")}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("weather.unableToFetch")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Farming Advice */}
        {/* You can render farmingAdvice here if needed, using t() for all strings */}

        {/* Weather Alerts */}
        {/* ...existing code... */}
      </div>
    </div>
  );
};


export default Weather;
