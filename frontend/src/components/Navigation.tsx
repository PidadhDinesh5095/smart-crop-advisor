import { useState, useEffect } from "react";
import { Link, useHref, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Mic, Globe, User, ChevronDown } from "lucide-react";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { set } from "date-fns";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, getCurrentLanguage } = useLanguage();
  const url=import.meta.env.BACKEND_URL || "http://localhost:4000";

  const navItems = [
    { name: t('nav.home'), href: "/" },
    { name: t('nav.soilAnalysis'), href: "/soil" },
    { name: t('nav.diseaseDetection'), href: "/disease" },
    { name: t('nav.fertilizerPlans'), href: "/fertilizer" },
    { name: t('nav.weather'), href: "/weather" },
    { name: t('nav.marketPrices'), href: "/market" },
    { name: t('nav.projects'), href: "/projects" },
  ];

  // Language selection removed; default is Hindi

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${url}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      toast.error(err.message || "logoutfailed");
    } 
    localStorage.removeItem("token");
    setLanguage('hi'); // Reset to default language on logout
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌾</span>
            </div>
            <span className="text-xl font-bold text-primary">{t('nav.title')  }</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Voice Controls & Language Toggle (only for not logged in) */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoggedIn && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(currentLanguage === 'hi' ? 'en' : 'hi')}
                >
                  {currentLanguage === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                </Button>
                <Button onClick={() => navigate('/login')} variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  {t('nav.login')}
                </Button>
                <Button onClick={() => navigate('/signup')} variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  {t('nav.register') ?? "Register"}
                </Button>
              </>
            )}
            {isLoggedIn && (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <User className="h-4 w-4" />
                {t('nav.logout') ?? "Logout"}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="voice" className="w-full" size="sm">
                <Mic className="h-4 w-4" />
                {t('nav.voice')}
              </Button>
              {!isLoggedIn && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => setLanguage(currentLanguage === 'hi' ? 'en' : 'hi')}
                  >
                    {currentLanguage === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                  </Button>
                  <Button onClick={() => navigate('/login')} variant="outline" className="w-full" size="sm">
                    <User className="h-4 w-4" />
                    {t('nav.login')}
                  </Button>
                  <Button onClick={() => navigate('/signup')} variant="outline" className="w-full" size="sm">
                    <User className="h-4 w-4" />
                    {t('nav.register') ?? "Register"}
                  </Button>
                </>
              )}
              {isLoggedIn && (
                <Button onClick={handleLogout} variant="outline" className="w-full" size="sm">
                  <User className="h-4 w-4" />
                  {t('nav.logout') ?? "Logout"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;