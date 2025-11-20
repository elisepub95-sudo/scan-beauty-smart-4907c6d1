import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplet, Sparkles, Target, AlertCircle, ArrowRight, Home } from "lucide-react";

interface DiagnosticResult {
  type_peau: string;
  etat_peau: string;
  objectifs: string[];
  sensibilites: string[];
  niveau_sensibilite: string;
  budget: string;
  reaction_produits: string;
}

const SkinDiagnosticResults = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestDiagnostic = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("Vous devez être connecté");
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("diagnostics")
          .select("*")
          .eq("user_id", user.id)
          .eq("type", "peau")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error("Aucun diagnostic trouvé");
          navigate("/diagnostic");
          return;
        }

        setResult(data.result as unknown as DiagnosticResult);
      } catch (error) {
        console.error("Error fetching diagnostic:", error);
        toast.error("Erreur lors du chargement du diagnostic");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestDiagnostic();
  }, [navigate]);

  const getRecommendations = (result: DiagnosticResult) => {
    const recommendations: string[] = [];

    // Recommandations basées sur le type de peau
    switch (result.type_peau) {
      case "sèche":
        recommendations.push("Utilisez des produits riches en actifs hydratants comme l'acide hyaluronique");
        recommendations.push("Privilégiez les textures crémeuses et nourrissantes");
        recommendations.push("Évitez les nettoyants trop agressifs");
        break;
      case "grasse":
        recommendations.push("Optez pour des produits matifiants et purifiants");
        recommendations.push("Utilisez des textures légères et fluides");
        recommendations.push("Ne négligez pas l'hydratation avec des formules oil-free");
        break;
      case "mixte":
        recommendations.push("Adaptez votre routine selon les zones (zone T et joues)");
        recommendations.push("Privilégiez les produits équilibrants");
        recommendations.push("Hydratez sans alourdir");
        break;
      case "sensible":
        recommendations.push("Choisissez des produits hypoallergéniques");
        recommendations.push("Évitez les parfums et alcool");
        recommendations.push("Testez les nouveaux produits progressivement");
        break;
      case "normale":
        recommendations.push("Maintenez l'équilibre avec une routine simple");
        recommendations.push("Protégez votre peau avec un SPF quotidien");
        break;
    }

    // Recommandations basées sur l'état
    switch (result.etat_peau) {
      case "déshydratée":
        recommendations.push("Intégrez un sérum hydratant à base d'acide hyaluronique");
        recommendations.push("Buvez suffisamment d'eau");
        break;
      case "terne":
        recommendations.push("Utilisez des produits exfoliants doux (AHA/BHA)");
        recommendations.push("Intégrez de la vitamine C dans votre routine");
        break;
      case "irritée":
        recommendations.push("Apaisez avec des actifs comme le centella asiatica");
        recommendations.push("Simplifiez votre routine temporairement");
        break;
      case "acnéique":
        recommendations.push("Utilisez des actifs anti-imperfections (acide salicylique, niacinamide)");
        recommendations.push("Nettoyez votre peau matin et soir");
        break;
      case "mature":
        recommendations.push("Intégrez des actifs anti-âge (rétinol, peptides)");
        recommendations.push("N'oubliez jamais votre crème contour des yeux");
        break;
    }

    // Recommandations basées sur les objectifs
    if (result.objectifs.includes("anti-taches")) {
      recommendations.push("Utilisez un SPF 50 quotidiennement pour prévenir les taches");
      recommendations.push("Intégrez des actifs éclaircissants (vitamine C, arbutine)");
    }

    return recommendations;
  };

  const getSkinTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sèche: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      grasse: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      mixte: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      normale: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      sensible: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Aucun résultat disponible</p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => navigate("/diagnostic")}>
                  Retour aux diagnostics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const recommendations = getRecommendations(result);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Résultats de votre diagnostic</h1>
          <p className="text-muted-foreground">Découvrez votre profil de peau et nos recommandations personnalisées</p>
        </div>

        <div className="space-y-6">
          {/* Type de peau */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                <CardTitle>Type de peau</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={getSkinTypeColor(result.type_peau)} variant="secondary">
                {result.type_peau.charAt(0).toUpperCase() + result.type_peau.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          {/* État actuel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>État actuel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">
                {result.etat_peau.charAt(0).toUpperCase() + result.etat_peau.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          {/* Objectifs */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Vos objectifs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.objectifs.map((objectif, index) => (
                  <Badge key={index} variant="secondary">
                    {objectif.charAt(0).toUpperCase() + objectif.slice(1)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sensibilités */}
          {result.sensibilites && result.sensibilites.length > 0 && result.sensibilites[0] !== "aucune" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <CardTitle>Sensibilités</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.sensibilites.map((sensibilite, index) => (
                    <Badge key={index} variant="destructive">
                      {sensibilite.charAt(0).toUpperCase() + sensibilite.slice(1)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommandations personnalisées */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Recommandations personnalisées</CardTitle>
              <CardDescription>
                Conseils adaptés à votre profil de peau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate("/routine")} className="flex-1">
              <ArrowRight className="mr-2 h-4 w-4" />
              Voir les routines recommandées
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinDiagnosticResults;
