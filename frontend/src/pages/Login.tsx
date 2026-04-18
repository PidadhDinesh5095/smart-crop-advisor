import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import VoiceButton from "@/components/VoiceButton";
import { toast } from "@/components/ui/use-toast"; // adjust import if needed
const url = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const { t, setLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    mobile: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(formData);
      const response = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: data.error || "Login failed",
        });
        setLoading(false);
        return;
      }

      if (!data.token) {
        toast({
          variant: "destructive",
          title: "No token received from server",
        });
        setLoading(false);
        return;
      }

      // Set language to user preferred language if available
      if (data.user && data.user.language) {
        localStorage.setItem("selectedLanguage", data.user.language);
        setLanguage(data.user.language);
      }

      localStorage.setItem("token", data.token);
      toast({
        title: t("auth.loginSuccess") || "login successful!",
        description: "login successful",
        className: "bg-green-500 text-white",
      });
      setTimeout(() => {
        window.location.href = "/"; // Redirect to home or dashboard
      }, 1500);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.message || "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-accent/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md shadow-large">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {t("auth.login")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button type="submit" className="w-full" variant="hero">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    
                  </span>
                ) : (
                  t("auth.login")
                )}
              </Button>
            </form>

            

            <Separator />

            <div className="text-center text-sm text-muted-foreground">
              {t("auth.dontHaveAccount")}{" "}
              <Link to="/signup" className="text-primary hover:underline">
                {t("auth.signup")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default Login;

