import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { indianStates, farmerTypes } from "@/data/indianStates";
import VoiceButton from "@/components/VoiceButton";
import LanguagePopup from "@/components/LanguagePopup";
import { toast } from "@/components/ui/use-toast"; // adjust import if your toast location is different

const Signup = () => {
  const url = import.meta.env.BACKEND_URL || "http://localhost:4000";
  const { t, setLanguage } = useLanguage();
  const [showLanguagePopup, setShowLanguagePopup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    location: "",
    age: "",
    farmerType: "",
    preferredLanguage: "english"
  });
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode as any);
    setFormData(prev => ({ ...prev, preferredLanguage: languageCode }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: t("auth.passwordMismatch"),
      });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${url}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: data.error || "Signup failed",
        });
        return;
      }
      setLoading(false);
      toast({
        title: t("auth.signupSuccess") || "Signup successful!",
        description: "Signup successful",
        className: "bg-green-500 text-white",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      // Optionally redirect to login or clear form after success
      // window.location.href = "/login";
      // or
      // setFormData({ ...initialState });

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.message || "Network error",
      });
    }
  };

  useEffect(() => {
    if (locationInput.trim() === "") {
      setLocationSuggestions([]);
    } else {
      setLocationSuggestions(
        indianStates.filter((state) =>
          state.toLowerCase().includes(locationInput.toLowerCase())
        )
      );
    }
  }, [locationInput]);

  return (
    <>
      <LanguagePopup 
        isOpen={showLanguagePopup}
        onClose={() => setShowLanguagePopup(false)}
        onLanguageSelect={handleLanguageSelect}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-accent/10">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-lg shadow-large">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                {t("auth.signup")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Language selection dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preferredLanguage">{t("auth.preferredLanguage")}</Label>
                    <VoiceButton text={t("auth.selectPreferredLanguage")} />
                  </div>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) => {
                      setFormData({ ...formData, preferredLanguage: value });
                      setLanguage(value as any);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("auth.selectPreferredLanguagePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(languages).map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name} {lang.nativeName ? `(${lang.nativeName})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name">{t("auth.name")}</Label>
                    <VoiceButton text={t("auth.enterName")} />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={t("auth.namePlaceholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mobile">{t("auth.mobile")}</Label>
                    <VoiceButton text={t("auth.enterMobile")} />
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder={t("auth.mobilePlaceholder")}
                    required
                  />
                </div>

                {/* Location input with suggestions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location">{t("auth.location")}</Label>
                    <VoiceButton text={t("auth.selectLocation")} />
                  </div>
                  <Input
                    id="location"
                    type="text"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      setFormData({ ...formData, location: e.target.value });
                    }}
                    placeholder={t("auth.selectLocationPlaceholder")}
                    autoComplete="off"
                    required
                  />
                  {locationSuggestions.length > 0 && (
                    <div className="border rounded bg-background shadow p-2 mt-1 max-h-40 overflow-y-auto z-10 absolute">
                      {locationSuggestions.map((state) => (
                        <div
                          key={state}
                          className="cursor-pointer px-2 py-1 hover:bg-accent"
                          onClick={() => {
                            setLocationInput(state);
                            setFormData({ ...formData, location: state });
                            setLocationSuggestions([]);
                          }}
                        >
                          {state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="age">{t("auth.age")}</Label>
                    <VoiceButton text={t("auth.enterAge")} />
                  </div>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder={t("auth.agePlaceholder")}
                    min="18"
                    max="100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="farmerType">{t("auth.farmerType.label")}</Label>
                    <VoiceButton text={t("auth.selectFarmerType")} />
                  </div>
                  <Select 
                    value={formData.farmerType} 
                    onValueChange={(value) => setFormData({...formData, farmerType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("auth.farmerType.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {farmerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(type.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <VoiceButton text={t("auth.enterPassword")} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={t("auth.passwordPlaceholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                    <VoiceButton text={t("auth.confirmPasswordText")} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" variant="hero">
                  {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    
                  </span>
                ) : (
                  t("auth.register")
                )}
                  
                </Button>
              </form>

              <Separator />

              <div className="text-center text-sm text-muted-foreground">
                {t("auth.alreadyHaveAccount")}{" "}
                <Link to="/login" className="text-primary hover:underline">
                  {t("auth.login")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};


export default Signup;
