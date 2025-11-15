import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scan, Camera, AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { searchProductByBarcode, parseIngredients } from "@/services/openFoodFacts";
import ProductAnalysis from "@/components/ProductAnalysis";
import type { Tables } from "@/integrations/supabase/types";

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brand, setBrand] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [analyzedProduct, setAnalyzedProduct] = useState<{
    name: string;
    brand?: string;
    ingredients: string[];
    matchedIngredients: Array<{
      ingredient: string;
      data: Tables<"global_ingredients"> | null;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeIngredients = async (ingredientsList: string[]) => {
    // Fetch global ingredients from database
    const { data: globalIngredients, error } = await supabase
      .from("global_ingredients")
      .select("*");

    if (error) {
      console.error("Error fetching global ingredients:", error);
      return ingredientsList.map(ing => ({ ingredient: ing, data: null }));
    }

    // Match ingredients with database
    return ingredientsList.map(ingredient => {
      const normalizedIngredient = ingredient.toLowerCase().trim();
      const match = globalIngredients?.find(
        gi => gi.name.toLowerCase().includes(normalizedIngredient) ||
              normalizedIngredient.includes(gi.name.toLowerCase())
      );
      
      return {
        ingredient,
        data: match || null
      };
    });
  };

  const handleScanBarcode = async () => {
    if (!barcode.trim()) {
      toast.error("Veuillez entrer un code-barres");
      return;
    }

    setLoading(true);
    setAnalyzedProduct(null);

    try {
      const product = await searchProductByBarcode(barcode);

      if (!product || !product.product) {
        toast.error("Produit non trouvé dans la base OpenFoodFacts");
        setLoading(false);
        return;
      }

      const { product: productData } = product;
      const ingredientsList = parseIngredients(productData.ingredients_text || "");

      if (ingredientsList.length === 0) {
        toast.error("Aucun ingrédient trouvé pour ce produit");
        setLoading(false);
        return;
      }

      const matchedIngredients = await analyzeIngredients(ingredientsList);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("scanned_products").insert({
          user_id: user.id,
          barcode: barcode,
          name: productData.product_name || "Produit sans nom",
          brand: productData.brands || null,
          category: productData.categories || null,
          ingredients: ingredientsList
        });
      }

      setAnalyzedProduct({
        name: productData.product_name || "Produit sans nom",
        brand: productData.brands,
        ingredients: ingredientsList,
        matchedIngredients
      });

      toast.success("Produit analysé avec succès !");
    } catch (error) {
      console.error("Error scanning product:", error);
      toast.error("Erreur lors du scan du produit");
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!productName || !ingredients) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    setAnalyzedProduct(null);

    try {
      const ingredientsList = parseIngredients(ingredients);

      if (ingredientsList.length === 0) {
        toast.error("Aucun ingrédient valide détecté");
        setLoading(false);
        return;
      }

      const matchedIngredients = await analyzeIngredients(ingredientsList);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("scanned_products").insert({
          user_id: user.id,
          barcode: barcode || null,
          name: productName,
          brand: brand || null,
          ingredients: ingredientsList
        });
      }

      setAnalyzedProduct({
        name: productName,
        brand: brand || undefined,
        ingredients: ingredientsList,
        matchedIngredients
      });

      toast.success("Produit analysé avec succès !");
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast.error("Erreur lors de l'analyse du produit");
    } finally {
      setLoading(false);
    }
  };

  const dangerLevels = [
    { level: 0, label: "Sûr", color: "bg-green-500", icon: CheckCircle2 },
    { level: 1, label: "Attention", color: "bg-yellow-500", icon: Info },
    { level: 2, label: "Modéré", color: "bg-orange-500", icon: AlertTriangle },
    { level: 3, label: "Élevé", color: "bg-red-500", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-medium">
              <Scan className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Scanner un produit</h1>
            <p className="text-muted-foreground">Analysez les ingrédients de vos cosmétiques</p>
          </div>

          {/* Scanner Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                Scanner le code-barres
              </CardTitle>
              <CardDescription>
                Entrez le code-barres du produit pour rechercher dans OpenFoodFacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scanBarcode">Code-barres</Label>
                <div className="flex gap-2">
                  <Input
                    id="scanBarcode"
                    placeholder="Ex: 3600523456789"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScanBarcode()}
                  />
                  <Button
                    onClick={handleScanBarcode}
                    disabled={loading || !barcode.trim()}
                    className="gradient-primary hover:opacity-90 transition-smooth shadow-soft"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Scanner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Saisie manuelle</CardTitle>
              <CardDescription>
                Ou entrez les informations du produit manuellement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nom du produit *</Label>
                <Input
                  id="productName"
                  placeholder="Ex: Crème hydratante visage"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Marque (optionnel)</Label>
                <Input
                  id="brand"
                  placeholder="Ex: L'Oréal"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="barcode">Code-barres (optionnel)</Label>
                <Input
                  id="barcode"
                  placeholder="Ex: 3600523456789"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Liste des ingrédients *</Label>
                <textarea
                  id="ingredients"
                  className="w-full min-h-32 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex: Aqua, Glycerin, Cetearyl Alcohol..."
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
              </div>

              <Button
                onClick={handleManualEntry}
                disabled={loading}
                className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-soft"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Analyser le produit"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analyzedProduct && (
            <ProductAnalysis
              productName={analyzedProduct.name}
              brand={analyzedProduct.brand}
              ingredients={analyzedProduct.ingredients}
              matchedIngredients={analyzedProduct.matchedIngredients}
            />
          )}

          {/* Danger Levels Info */}
          {!analyzedProduct && (
            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="text-lg">Niveaux de danger</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dangerLevels.map((danger) => (
                    <div key={danger.level} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${danger.color}`}></div>
                      <span className="text-sm font-medium">{danger.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
