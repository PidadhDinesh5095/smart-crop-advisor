import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import FeatureCard from "@/components/FeatureCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sprout, Bug, Beaker, CloudRain, TrendingUp, FolderOpen, Users, Award, Shield } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";
import soilImage from "@/assets/soil-analysis.jpg";
import diseaseImage from "@/assets/disease-detection.jpg";
import fertilizerImage from "@/assets/fertilizer-plans.jpg";
import weatherImage from "@/assets/weather-monitoring.jpg";
import marketImage from "@/assets/market-prices.jpg";
import LanguageMeta from "@/components/LanguageMeta";
import { useState } from "react";

const Index = () => {
  const { t } = useLanguage();
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  const features = [
    {
      title: t('feature.soilAnalysis.title'),
      description: t('feature.soilAnalysis.description'),
      image: soilImage,
      href: "/soil",
      icon: <Sprout className="h-6 w-6 text-success" />,
      color: "success" as const
    },
    {
      title: t('feature.diseaseDetection.title'),
      description: t('feature.diseaseDetection.description'),
      image: diseaseImage,
      href: "/disease", 
      icon: <Bug className="h-6 w-6 text-destructive" />,
      color: "primary" as const
    },
    {
      title: t('feature.fertilizerPlans.title'),
      description: t('feature.fertilizerPlans.description'),
      image: fertilizerImage,
      href: "/fertilizer",
      icon: <Beaker className="h-6 w-6 text-earth" />,
      color: "earth" as const
    },
    {
      title: t('feature.weather.title'),
      description: t('feature.weather.description'),
      image: weatherImage,
      href: "/weather",
      icon: <CloudRain className="h-6 w-6 text-accent" />,
      color: "accent" as const
    },
    {
      title: t('feature.marketPrices.title'),
      description: t('feature.marketPrices.description'),
      image: marketImage,
      href: "/market",
      icon: <TrendingUp className="h-6 w-6 text-warning" />,
      color: "primary" as const
    },
    {
      title: t('feature.projects.title'),
      description: t('feature.projects.description'),
      image: soilImage,
      href: "/projects",
      icon: <FolderOpen className="h-6 w-6 text-primary" />,
      color: "success" as const
    }
  ];

  const stats = [
    { icon: <Users className="h-8 w-8 text-primary" />, value: "50K+", label: t('stats.farmersHelped') },
    { icon: <Award className="h-8 w-8 text-success" />, value: "95%", label: t('stats.accuracyRate') },
    { icon: <Shield className="h-8 w-8 text-earth" />, value: "24/7", label: t('stats.supportAvailable') },
  ];

  // Add voice demo handler
  const handleDemoVoice = () => {
    const text = t('home.demo');
    const utter = new window.SpeechSynthesisUtterance(text);
    const selectedLang = localStorage.getItem("selectedLanguage");
    if (selectedLang) {
      utter.lang = selectedLang;
    }
    utter.onend = () => setIsDemoPlaying(false);
    utter.onerror = () => setIsDemoPlaying(false);
    setIsDemoPlaying(true);
    window.speechSynthesis.speak(utter);
  };

  const handleStopDemoVoice = () => {
    window.speechSynthesis.cancel();
    setIsDemoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <LanguageMeta />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Smart Agriculture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('home.title')}
              <span className="block text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                {t('home.titleAccent')}
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t('home.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero" size="lg" onClick={()=>{window.location.href='/soil'}} className="text-lg px-8 py-4">
                {t('home.startButton')}
              </Button>
              
            </div>
            {/* Demo voice button with stop functionality */}
            {!isDemoPlaying ? (
              <Button
                variant="secondary"
                size="lg"
                className="mt-4"
                onClick={handleDemoVoice}
              >
                {t('home.demoVoiceButton') ?? "Hear Demo"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                className="mt-4"
                onClick={handleStopDemoVoice}
              >
                {t('home.stopDemoVoiceButton') ?? "Stop Demo"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
     {/** <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-3 animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>**/} 

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              {t('home.featuresTitle')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.featuresSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/**<section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                {t('home.trialButton')}
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10">
                {t('home.supportButton')}
              </Button>
            </div>
          </div }
        </div>
      </section>**/}

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🌾</span>
            </div>
            <span className="text-lg font-bold text-primary">{t('home.title')}</span>
          </div>
          <p className="text-muted-foreground">
            Empowering farmers with AI technology for sustainable agriculture
          </p>
          
        </div>
      </footer>
    </div>
  );
};

export default Index;
