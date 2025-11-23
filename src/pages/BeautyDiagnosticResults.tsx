import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Sun, Moon, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BeautyProfile {
  profile: string;
  description: string;
  recommended_ingredients: string[];
  ingredients_to_avoid: string[];
  routine: {
    morning: string[];
    evening: string[];
    weekly: string[];
  };
}

interface BeautyDiagnosticResult {
  beauty_profile: {
    sleep: string;
    hydration: string;
    stress: string;
    sun_exposure: string;
    environment: string;
    routine_frequency: string;
    routine_steps: string;
    makeup_removal: string;
    style: string;
    ingredients_preference: string;
    SPF_usage: string;
    goals: string[];
    knowledge_level: string;
    actives_comfort: string;
    profile_category: string;
  };
  profiles: BeautyProfile[];
}

const BeautyDiagnosticResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<BeautyDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (location.state?.result) {
        setResult(location.state.result);
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("diagnostics")
          .select("*")
          .eq("user_id", user.id)
          .eq("type", "beauty")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data?.result) {
          setResult(data.result as unknown as BeautyDiagnosticResult);
        }
      } catch (error) {
        console.error("Error loading beauty diagnostic:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
        <Navigation />
        <div className="container mx-auto px-4 pt-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
        <Navigation />
        <div className="container mx-auto px-4 pt-8">
          <div className="text-center">
            <p className="mb-4">Aucun résultat trouvé</p>
            <Button onClick={() => navigate("/diagnostic/beaute")}>
              Faire un diagnostic
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />

      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-medium">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Votre Profil Beauté</h1>
            <p className="text-muted-foreground">
              Recommandations personnalisées pour votre routine beauté
            </p>
          </div>

          {/* Profil Beauté */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Votre Profil
              </CardTitle>
              <CardDescription>
                Catégorie : {result.beauty_profile.profile_category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Niveau de connaissance</p>
                  <Badge variant="secondary">{result.beauty_profile.knowledge_level}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Fréquence routine</p>
                  <Badge variant="secondary">{result.beauty_profile.routine_frequency}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Étapes routine</p>
                  <Badge variant="secondary">{result.beauty_profile.routine_steps}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Protection solaire</p>
                  <Badge variant="secondary">{result.beauty_profile.SPF_usage}</Badge>
                </div>
              </div>

              {result.beauty_profile.goals.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Vos objectifs</p>
                  <div className="flex flex-wrap gap-2">
                    {result.beauty_profile.goals.map((goal, index) => (
                      <Badge key={index} variant="outline">{goal}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profils Beauté Recommandés */}
          {result.profiles.map((profile, index) => (
            <Card key={index} className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="capitalize">{profile.profile.replace(/-/g, ' ')}</CardTitle>
                <CardDescription>{profile.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ingrédients recommandés */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Ingrédients recommandés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.recommended_ingredients.map((ingredient, idx) => (
                      <Badge key={idx} variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ingrédients à éviter */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    Ingrédients à éviter
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.ingredients_to_avoid.map((ingredient, idx) => (
                      <Badge key={idx} variant="destructive" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Routine Matin */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-orange-500" />
                    Routine du matin
                  </h3>
                  <ul className="space-y-2">
                    {profile.routine.morning.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-medium">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Routine Soir */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-blue-500" />
                    Routine du soir
                  </h3>
                  <ul className="space-y-2">
                    {profile.routine.evening.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-medium">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Routine Hebdomadaire */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Routine hebdomadaire
                  </h3>
                  <ul className="space-y-2">
                    {profile.routine.weekly.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-medium">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/diagnostic")} className="flex-1">
              Retour aux diagnostics
            </Button>
            <Button onClick={() => navigate("/routine")} className="flex-1">
              Voir ma routine complète
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautyDiagnosticResults;
