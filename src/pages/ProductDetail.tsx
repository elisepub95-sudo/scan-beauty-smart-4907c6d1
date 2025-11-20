import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  ingredients: string[];
  type: string;
  category: string;
}

interface IngredientData {
  name: string;
  danger_level: string;
  category: string;
  description: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [ingredientsData, setIngredientsData] = useState<IngredientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const { data: productData, error } = await supabase
        .from("global_products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setProduct(productData);

      // Récupérer les détails des ingrédients
      if (productData.ingredients && productData.ingredients.length > 0) {
        const { data: ingredientsInfo } = await supabase
          .from("global_ingredients")
          .select("*")
          .in("name", productData.ingredients);

        setIngredientsData(ingredientsInfo || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
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
          icon: CheckCircle,
        };
      case "1":
        return {
          label: "Modéré",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: AlertCircle,
        };
      case "2":
        return {
          label: "Dangereux",
          color: "text-red-600",
          bgColor: "bg-red-100",
          icon: AlertCircle,
        };
      default:
        return {
          label: "Inconnu",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: HelpCircle,
        };
    }
  };

  const categorizeIngredients = () => {
    const dangerous: IngredientData[] = [];
    const moderate: IngredientData[] = [];
    const safe: IngredientData[] = [];
    const unknown: string[] = [];

    if (!product) return { dangerous, moderate, safe, unknown };

    product.ingredients.forEach((ingName) => {
      const ingData = ingredientsData.find((i) => i.name === ingName);
      if (ingData) {
        if (ingData.danger_level === "2") dangerous.push(ingData);
        else if (ingData.danger_level === "1") moderate.push(ingData);
        else safe.push(ingData);
      } else {
        unknown.push(ingName);
      }
    });

    return { dangerous, moderate, safe, unknown };
  };

  const calculateOverallRisk = () => {
    const { dangerous, moderate } = categorizeIngredients();
    if (dangerous.length > 0) return "2";
    if (moderate.length >= 2) return "2";
    if (moderate.length > 0) return "1";
    return "0";
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Produit non trouvé</p>
        </div>
      </div>
    );
  }

  const { dangerous, moderate, safe, unknown } = categorizeIngredients();
  const overallRisk = calculateOverallRisk();
  const riskConfig = getDangerConfig(overallRisk);

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

        {/* En-tête produit */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
                {product.brand && (
                  <p className="text-lg text-muted-foreground">{product.brand}</p>
                )}
                {product.barcode && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Code-barres: {product.barcode}
                  </p>
                )}
              </div>
              <div className={`px-4 py-2 rounded-lg ${riskConfig.bgColor}`}>
                <div className="flex items-center gap-2">
                  <riskConfig.icon className={`h-5 w-5 ${riskConfig.color}`} />
                  <span className={`font-semibold ${riskConfig.color}`}>
                    {riskConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {product.type && <Badge variant="outline">{product.type}</Badge>}
              {product.category && <Badge variant="outline">{product.category}</Badge>}
              <Badge variant="secondary">
                {product.ingredients.length} ingrédients
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Résumé des ingrédients */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dangerous.length > 0 && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{dangerous.length}</p>
                  <p className="text-sm text-red-600">Dangereux</p>
                </div>
              )}
              {moderate.length > 0 && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{moderate.length}</p>
                  <p className="text-sm text-yellow-600">Modérés</p>
                </div>
              )}
              {safe.length > 0 && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{safe.length}</p>
                  <p className="text-sm text-green-600">Sûrs</p>
                </div>
              )}
              {unknown.length > 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{unknown.length}</p>
                  <p className="text-sm text-gray-600">Inconnus</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ingrédients dangereux */}
        {dangerous.length > 0 && (
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Ingrédients dangereux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dangerous.map((ing, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => navigate(`/ingredient/${ing.name}`)}
                >
                  <h4 className="font-semibold text-red-900">{ing.name}</h4>
                  {ing.category && (
                    <p className="text-sm text-red-700 mt-1">{ing.category}</p>
                  )}
                  {ing.description && (
                    <p className="text-sm text-red-800 mt-2">{ing.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Ingrédients modérés */}
        {moderate.length > 0 && (
          <Card className="mb-6 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Ingrédients modérés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {moderate.map((ing, index) => (
                <div
                  key={index}
                  className="p-4 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => navigate(`/ingredient/${ing.name}`)}
                >
                  <h4 className="font-semibold text-yellow-900">{ing.name}</h4>
                  {ing.category && (
                    <p className="text-sm text-yellow-700 mt-1">{ing.category}</p>
                  )}
                  {ing.description && (
                    <p className="text-sm text-yellow-800 mt-2">{ing.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Ingrédients sûrs */}
        {safe.length > 0 && (
          <Card className="mb-6 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Ingrédients sûrs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {safe.map((ing, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-green-50"
                    onClick={() => navigate(`/ingredient/${ing.name}`)}
                  >
                    {ing.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ingrédients inconnus */}
        {unknown.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-gray-600 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Ingrédients non analysés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unknown.map((ing, index) => (
                  <Badge key={index} variant="secondary">
                    {ing}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
