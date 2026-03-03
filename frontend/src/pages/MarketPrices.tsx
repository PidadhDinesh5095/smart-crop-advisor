import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import VoiceInput from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Bell, Loader2 } from "lucide-react";
import marketImage from "@/assets/market-prices.jpg";
import { useLanguage } from "@/contexts/LanguageContext"; // add import

const GEMINI_API_KEY = "AIzaSyAtWVmkc7b08-o2JBlPTzJkVrbZA3ryf9E"; 
const GEMINI_MODEL = "gemini-2.5-flash"; 

const callGemini = async (prompt: string, language: string) => {
  // Add language preference to the prompt
  const langPrompt = language && language !== "en"
    ? `${prompt} Respond in ${language} language.`
    : prompt;
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: langPrompt }] }]
    }),
  });
  console.log("Gemini API response status:", res);
  if (!res.ok) throw new Error("Gemini API error");
  const data = await res.json();
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = text.match(/```json\s*([\s\S]*?)```/i);
    if (match) {
      return JSON.parse(match[1]);
    }
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const MarketPrices = () => {
  const { t } = useLanguage(); // add hook
  const [apiPrices, setApiPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCrop, setSearchCrop] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userLang, setUserLang] = useState<string>("en");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const getToday = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const date = getToday();
          const prompt = `Give me a JSON array of all crop prices (fields: crop, currentPrice, unit, market, quality, date) for today (${date}) near latitude ${lat}, longitude ${lon}. Respond only with JSON.`;
          const data = await callGemini(prompt, userLang);
          setApiPrices(Array.isArray(data) ? data : data.prices || []);
        } catch (e: any) {
          setError(e.message || "Error fetching prices");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location access denied");
        setLoading(false);
      }
    );
  
  }, [userLang]);

  useEffect(() => {
    // Fetch market analysis and trends
    setAnalysisLoading(true);
    setAnalysisError(null);
    if (!navigator.geolocation) {
      setAnalysisError("Geolocation not supported");
      setAnalysisLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const date = getToday();
          const prompt = `Give me a short, structured market analysis and trend summary for all major crops for today (${date}) near latitude ${lat}, longitude ${lon}. Respond in markdown and in ${userLang} language.`;
          const data = await callGemini(prompt, userLang);
          // If Gemini returns a string, use it directly; if object, try to extract text
          setAnalysis(typeof data === "string" ? data : data.analysis || JSON.stringify(data));
        } catch (e: any) {
          setAnalysisError(e.message || "Error fetching analysis");
        } finally {
          setAnalysisLoading(false);
        }
      },
      (err) => {
        setAnalysisError("Location access denied");
        setAnalysisLoading(false);
      }
    );
  }, [userLang]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCrop.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setSearchLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const date = getToday();
          const prompt = `Give me a JSON object for the latest price and details (fields: crop, currentPrice, unit, market, quality, date) for ${searchCrop} today (${date}) near latitude ${lat}, longitude ${lon}. Respond only with JSON.`;
          const data = await callGemini(prompt, userLang);
          setSearchResult(data);
        } catch (e: any) {
          setError(e.message || "Error fetching crop price");
        } finally {
          setSearchLoading(false);
        }
      },
      (err) => {
        setError("Location access denied");
        setSearchLoading(false);
      }
    );
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up" || change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">{t("market.title")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("market.subtitle")}
          </p>
        </div>

        {/* Language Selector */}
        <div className="mb-4 flex justify-end">
          <label className="mr-2 font-medium">{t("market.language")}</label>
          <select value={userLang} onChange={e => setUserLang(e.target.value)} className="border rounded px-2 py-1">
            <option value="en">{t("market.english")}</option>
            <option value="hi">{t("market.hindi")}</option>
            <option value="mr">{t("market.marathi")}</option>
            <option value="ta">{t("market.tamil")}</option>
            <option value="te">{t("market.telugu")}</option>
            <option value="bn">{t("market.bengali")}</option>
            {/* Add more as needed */}
          </select>
        </div>

        {/* Gemini API Crop Prices Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-warning" />
                {t("market.latestPrices")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder={t("market.enterCropName")}
                  className="border rounded px-3 py-2 flex-1"
                  value={searchCrop}
                  onChange={e => setSearchCrop(e.target.value)}
                  disabled={searchLoading}
                />
                <Button type="submit" disabled={searchLoading || !searchCrop.trim()}>
                  {searchLoading ? <Loader2 className="animate-spin h-4 w-4" /> : t("market.search")}
                </Button>
              </form>
              {error && <div className="text-red-600 text-sm mb-2">{t(error)}</div>}
              {searchLoading && (
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Loader2 className="animate-spin h-4 w-4" /> {t("market.fetchingCropPrice")}
                </div>
              )}
              {/* Show search result above all crop prices */}
              {searchResult && (
                <div className="mb-4">
                  <Card className="border-green-300">
                    <CardHeader>
                      <CardTitle>{searchResult.crop}</CardTitle>
                      <CardDescription>
                        {searchResult.market} • {searchResult.quality}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">₹{searchResult.currentPrice}</span>
                        <span className="text-sm text-muted-foreground">{searchResult.unit}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t("market.lastUpdated")}: {searchResult.date || getToday()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="animate-spin h-4 w-4" /> {t("market.loadingPrices")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiPrices.length > 0 ? (
                    apiPrices.map((item, idx) => (
                      <Card key={idx} className="animate-fade-in hover:shadow-medium transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{item.crop}</CardTitle>
                            {/* Optionally show trend icon if available */}
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.market} • {item.quality}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold">₹{item.currentPrice}</span>
                              <span className="text-sm text-muted-foreground">{item.unit}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {t("market.lastUpdated")}: {item.date || getToday()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-muted-foreground">{t("market.noPricesFound")}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 w-[100%] lg:grid-cols-4 gap-8">
          {/* Price Cards */}
          <div className="lg:col-span-3 space-y-4 w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t("market.todaysPrices")}</h2>
              <Badge variant="outline" className="text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                {t("market.updated")} {loading ? "..." : t("market.recently")}
              </Badge>
            </div>
            {/* Only show Gemini API crop prices */}
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin h-4 w-4" /> {t("market.loadingPrices")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {apiPrices.length > 0 ? (
                  apiPrices.map((item, idx) => (
                    <Card key={idx} className="animate-fade-in hover:shadow-medium transition-shadow w-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{item.crop}</CardTitle>
                          {/* Optionally show trend icon if available */}
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.market} • {item.quality}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">₹{item.currentPrice}</span>
                            <span className="text-sm text-muted-foreground">{item.unit}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {t("market.lastUpdated")}: {item.date || getToday()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-muted-foreground">{t("market.noPricesFound")}</div>
                )}
              </div>
            )}
          </div>
          {/* Sidebar removed */}
        </div>

        {/* Market Analysis */}
        
      </div>
    </div>
  );
};


export default MarketPrices;

