import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Scissors, Check, X, AlertCircle, Sun, Moon, Calendar } from "lucide-react";

interface HairDiagnosticResult {
  hair_type: {
    thickness: string;
    texture: string;
    scalp: string;
    global_type: string;
  };
  current_condition: string[];
  habits: {
    washing_frequency: string;
    heat_tools: string[];
    chemical_treatments: string[];
    environment: string;
  };
  goals: string[];
  sensitivities: string[];
  recommendations: {
    ingredients_to_use: string[];
    ingredients_to_avoid: string[];
    routine: {
      morning: string[];
      evening: string[];
      weekly: string[];
    };
  };
}

const HairDiagnosticResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<HairDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      // Check if result is in location state (from submit)
      if (location.state?.result) {
        setResult(location.state.result);
        setLoading(false);
        return;
      }

      // Otherwise load from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("diagnostics")
        .select("result")
        .eq("user_id", user.id)
        .eq("type", "cheveux")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setResult(data.result as unknown as HairDiagnosticResult);
      }
    } catch (error) {
      console.error("Error loading result:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="animate-pulse">
          <Scissors className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
        <Navigation />
        <div className="container mx-auto px-4 pt-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Aucun diagnostic trouvé</h1>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore effectué de diagnostic cheveux
            </p>
            <Button onClick={() => navigate("/diagnostic/cheveux")}>
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-secondary mb-4 shadow-medium">
              <Scissors className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Ton Profil Capillaire</h1>
            <p className="text-muted-foreground">
              Résultat de ton diagnostic personnalisé
            </p>
          </div>

          {/* Type de cheveux */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Type de cheveux</CardTitle>
              <CardDescription>Ton profil capillaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {result.hair_type.global_type}
                </Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Épaisseur :</span>
                  <p className="font-medium">{result.hair_type.thickness}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Texture :</span>
                  <p className="font-medium">{result.hair_type.texture}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cuir chevelu :</span>
                  <p className="font-medium">{result.hair_type.scalp}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* État actuel et objectifs */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  État actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.current_condition.map((condition, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2" />
                      <span className="text-sm">{condition}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Tes objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.goals.map((goal, index) => (
                    <Badge key={index} variant="outline">{goal}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ingrédients recommandés */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  Ingrédients à utiliser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.recommendations.ingredients_to_use.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <X className="w-5 h-5" />
                  Ingrédients à éviter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.recommendations.ingredients_to_avoid.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Routine personnalisée */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Ta routine capillaire personnalisée</CardTitle>
              <CardDescription>Suis ces étapes pour des cheveux en pleine santé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Routine matin */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Sun className="w-5 h-5 text-yellow-600" />
                  Routine du matin
                </h3>
                <div className="space-y-2 pl-7">
                  {result.recommendations.routine.morning.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Routine soir */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Moon className="w-5 h-5 text-blue-600" />
                  Routine du soir
                </h3>
                <div className="space-y-2 pl-7">
                  {result.recommendations.routine.evening.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Routine hebdomadaire */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Routine hebdomadaire
                </h3>
                <div className="space-y-2 pl-7">
                  {result.recommendations.routine.weekly.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sensibilités */}
          {result.sensitivities.length > 0 && (
            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95 border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="w-5 h-5" />
                  Tes sensibilités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.sensitivities.map((sensitivity, index) => (
                    <Badge key={index} variant="outline" className="border-yellow-300 text-yellow-700">
                      {sensitivity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => navigate("/diagnostic/cheveux")} variant="outline" className="flex-1">
              Refaire le diagnostic
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

export default HairDiagnosticResults;
