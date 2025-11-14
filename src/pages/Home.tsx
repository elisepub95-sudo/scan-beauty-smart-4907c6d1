import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, Stethoscope, Sparkles, TrendingUp } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setUser(session.user);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <div className="animate-pulse">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Scan,
      title: "Scanner un produit",
      description: "Analysez instantanément les ingrédients de vos cosmétiques",
      action: () => navigate("/scan"),
      gradient: "gradient-primary",
    },
    {
      icon: Stethoscope,
      title: "Faire un diagnostic",
      description: "Découvrez votre profil beauté personnalisé",
      action: () => navigate("/diagnostic"),
      gradient: "gradient-secondary",
    },
    {
      icon: Sparkles,
      title: "Ma routine",
      description: "Consultez votre routine beauté sur mesure",
      action: () => navigate("/routine"),
      gradient: "bg-accent",
    },
  ];

  return (
    <div className="min-h-screen gradient-subtle pb-20 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-medium animate-bounce-subtle">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent gradient-primary">
            Scan & Know Beauty
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez la vérité sur vos cosmétiques et obtenez une routine beauté personnalisée
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          <Card className="shadow-soft border-border/50 backdrop-blur-sm bg-card/95">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">12K+</div>
              <div className="text-sm text-muted-foreground">Ingrédients</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border/50 backdrop-blur-sm bg-card/95">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border/50 backdrop-blur-sm bg-card/95">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-accent mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Disponible</div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-105 cursor-pointer border-border/50 backdrop-blur-sm bg-card/95 overflow-hidden group"
              onClick={feature.action}
            >
              <div className={`h-2 ${feature.gradient}`}></div>
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                  Commencer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className="text-2xl">Pourquoi choisir Scan & Know ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">🔬 Analyse scientifique</h3>
                  <p className="text-sm text-muted-foreground">
                    Base de données complète avec classification détaillée des ingrédients
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">✨ Routines personnalisées</h3>
                  <p className="text-sm text-muted-foreground">
                    Recommandations adaptées à votre type de peau et cheveux
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-accent">🛡️ Sécurité avant tout</h3>
                  <p className="text-sm text-muted-foreground">
                    Identification des ingrédients à risque pour votre santé
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">📊 Suivi complet</h3>
                  <p className="text-sm text-muted-foreground">
                    Historique de vos scans et évolution de votre routine
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
