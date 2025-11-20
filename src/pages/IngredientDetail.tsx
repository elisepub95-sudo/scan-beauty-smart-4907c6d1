import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertCircle, CheckCircle, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  danger_level: string;
  description: string;
  suitable_for: string[];
  avoid_for: string[];
}

export default function IngredientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIngredientDetails();
  }, [id]);

  const fetchIngredientDetails = async () => {
    try {
      // L'id peut être soit l'UUID soit le nom de l'ingrédient
      let query = supabase.from("global_ingredients").select("*");
      
      // Vérifier si l'id est un UUID ou un nom
      if (id?.includes("-")) {
        query = query.eq("id", id);
      } else {
        query = query.eq("name", decodeURIComponent(id || ""));
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      setIngredient(data);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ingrédient:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDangerConfig = (level: string) => {
    switch (level) {
      case "0":
        return {
          label: "Sûr",
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-200",
          icon: CheckCircle,
        };
      case "1":
        return {
          label: "Modéré",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
          icon: AlertCircle,
        };
      case "2":
        return {
          label: "Dangereux",
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
          icon: AlertCircle,
        };
      default:
        return {
          label: "Inconnu",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
          icon: HelpCircle,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Ingrédient non trouvé</p>
        </div>
      </div>
    );
  }

  const dangerConfig = getDangerConfig(ingredient.danger_level);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* En-tête ingrédient */}
        <Card className={`mb-6 ${dangerConfig.borderColor}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{ingredient.name}</CardTitle>
                {ingredient.category && (
                  <p className="text-lg text-muted-foreground">{ingredient.category}</p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-lg ${dangerConfig.bgColor} flex items-center gap-2`}>
                <dangerConfig.icon className={`h-5 w-5 ${dangerConfig.color}`} />
                <span className={`font-semibold ${dangerConfig.color}`}>
                  {dangerConfig.label}
                </span>
              </div>
            </div>
          </CardHeader>
          {ingredient.description && (
            <CardContent>
              <p className="text-base">{ingredient.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Recommandations par type de peau */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Recommandé pour */}
          {ingredient.suitable_for && ingredient.suitable_for.length > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2 text-lg">
                  <ThumbsUp className="h-5 w-5" />
                  Recommandé pour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ingredient.suitable_for.map((skinType, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50">
                      {skinType}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* À éviter pour */}
          {ingredient.avoid_for && ingredient.avoid_for.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
                  <ThumbsDown className="h-5 w-5" />
                  À éviter pour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ingredient.avoid_for.map((skinType, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50">
                      {skinType}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Informations complémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations complémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Niveau de dangerosité</h4>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${dangerConfig.bgColor}`} />
                <span className={dangerConfig.color}>{dangerConfig.label}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {ingredient.danger_level === "0" && "Cet ingrédient est considéré comme sûr pour la plupart des personnes."}
                {ingredient.danger_level === "1" && "Cet ingrédient présente un risque modéré. Vérifiez qu'il convient à votre type de peau."}
                {ingredient.danger_level === "2" && "Cet ingrédient présente des risques importants. Il est recommandé de l'éviter ou de consulter un dermatologue."}
              </p>
            </div>

            {ingredient.category && (
              <div>
                <h4 className="font-semibold mb-2">Catégorie</h4>
                <Badge variant="secondary">{ingredient.category}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
