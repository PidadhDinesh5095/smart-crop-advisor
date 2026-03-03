import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import VoiceInput from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Beaker, Calendar, CheckCircle, Clock, Sprout, Bell } from "lucide-react";
import fertilizerImage from "@/assets/fertilizer-plans.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const FertilizerPlans = () => {
  const { t } = useLanguage();
  const language = document.documentElement.lang || "en";
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;

  // Sort crops and growthStages in ascending order
  const crops = [
  // Cereals
  "Wheat", "Rice", "Corn", "Barley", "Oats", "Millet", "Sorghum",

  // Pulses / Legumes
  "Chickpea", "Pigeon Pea", "Lentil", "Green Gram", "Black Gram", "Kidney Bean",

  // Oilseeds
  "Soybean", "Groundnut", "Sunflower", "Mustard", "Sesame", "Castor",

  // Vegetables
  "Tomato", "Potato", "Onion", "Garlic", "Carrot", "Cabbage", "Cauliflower", 
  "Brinjal", "Okra", "Cucumber", "Pumpkin", "Peas", "Chili", "Spinach",

  // Fruits
  "Banana", "Mango", "Apple", "Grapes", "Papaya", "Pineapple", "Guava", 
  "Watermelon", "Muskmelon", "Orange", "Lemon", "Pomegranate", "Strawberry",

  // Cash Crops
  "Cotton", "Sugarcane", "Tobacco", "Tea", "Coffee", "Jute", "Rubber",

  // Spices & Others
  "Turmeric", "Ginger", "Cardamom", "Black Pepper", "Coriander", "Cumin",
  "Fennel", "Fenugreek", "Clove"
].sort((a, b) => a.localeCompare(b));

  const growthStages = [
    "Seed Germination", "Vegetative Growth", "Flowering", "Fruit Development", "Maturity"
  ].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const generatePlan = async () => {
    if (selectedCrop && selectedStage) {
      setLoading(true);
      setPlan(null);
      const token = localStorage.getItem("token");
      try {
        let data = null;
        while (!data) {
          const response = await fetch(
            `${url}/disease/plan`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token || ""}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                crop: selectedCrop,
                stage: selectedStage
              })
            }
          );
          if (response.ok) {
            data = await response.json();
            setPlan(data);
          } else {
            // Optionally break or retry based on error
            setPlan(null);
            break;
          }
        }
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTaskCompletion = (index: number) => {
    setCompletedTasks(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div
      className="min-h-screen bg-background"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">{t("fertilizer.title") || "Fertilizer Plans"}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("fertilizer.subtitle") ||
              "Get personalized fertilizer schedules based on your crop type and growth stage with AI-powered nutrient management recommendations."}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Generator */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-earth" />
                {t("fertilizer.generatePlan") || "Generate Fertilizer Plan"}
              </CardTitle>
              <CardDescription>
                {t("fertilizer.generatePlanDesc") ||
                  "Select your crop and current growth stage to get customized recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("fertilizer.selectCrop") || "Select Crop"}</label>
                  <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fertilizer.chooseCrop") || "Choose your crop"} />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {t(`crops.${crop}`) || crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("fertilizer.growthStage") || "Growth Stage"}</label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fertilizer.currentStage") || "Current growth stage"} />
                    </SelectTrigger>
                    <SelectContent>
                      {growthStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {t(`growthStages.${stage}`) || stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={generatePlan}
                  className="w-full"
                  variant="earth"
                  disabled={!selectedCrop || !selectedStage}
                >
                  <Sprout className="h-4 w-4" />
                  {t("fertilizer.generatePlanBtn") || "Generate Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plan Details */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-success" />
                {t("fertilizer.schedule") || "Fertilizer Schedule"}
              </CardTitle>
              <CardDescription>
                {t("fertilizer.scheduleDesc") || "Your personalized fertilizer application timeline"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <p className="text-muted-foreground">{t("fertilizer.loading") || "Generating plan, please wait..."}</p>
                </div>
              ) : plan && plan.fertilizerPlan ? (
                <div className="space-y-6">
                  {/* Plan Overview */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-earth/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t("fertilizer.crop") || "Crop"}</p>
                      <p className="text-lg">{plan.fertilizerPlan.crop}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("fertilizer.stage") || "Stage"}</p>
                      <p className="text-lg">{plan.fertilizerPlan.stage}</p>
                    </div>
                  </div>

                  {/* Recommended Fertilizers */}
                  <div>
                    <h4 className="font-semibold mb-3">{t("fertilizer.recommendedFertilizers") || "Recommended Fertilizers"}</h4>
                    <div className="space-y-3">
                      {plan.fertilizerPlan.recommendedFertilizers.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-lg bg-background">
                          <div className="font-medium text-lg">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.type}</div>
                          <div className="text-sm">{t("fertilizer.dosage") || "Dosage"}: {item.dosage}</div>
                          <div className="text-sm">{t("fertilizer.applicationMethod") || "Application Method"}: {item.applicationMethod}</div>
                          <div className="text-sm">{t("fertilizer.timing") || "Timing"}: {item.timing}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micronutrient Recommendations */}
                  <div>
                    <h4 className="font-semibold mb-3">{t("fertilizer.micronutrients") || "Micronutrient Recommendations"}</h4>
                    <ul className="list-disc ml-6 space-y-1">
                      {plan.fertilizerPlan.micronutrientRecommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Organic Amendments */}
                  <div>
                    <h4 className="font-semibold mb-3">{t("fertilizer.organicAmendments") || "Organic Amendments"}</h4>
                    <ul className="list-disc ml-6 space-y-1">
                      {plan.fertilizerPlan.organicAmendments.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety and Environmental Tips */}
                  <div>
                    <h4 className="font-semibold mb-3">{t("fertilizer.safetyAndEnvironmentalTips") || "Safety & Environmental Tips"}</h4>
                    <ul className="list-disc ml-6 space-y-1">
                      {plan.fertilizerPlan.safetyAndEnvironmentalTips.map((tip: string, idx: number) => (
                        <li key={idx} className="text-sm">{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="font-semibold mb-3">{t("fertilizer.notes") || "Notes"}</h4>
                    <div className="text-sm">{plan.fertilizerPlan.notes}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <img
                    src={fertilizerImage}
                    alt="Fertilizer Plans"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground">
                    {t("fertilizer.selectToGenerate") || "Select crop and stage to generate plan"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default FertilizerPlans;
