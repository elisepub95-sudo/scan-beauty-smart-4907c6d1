import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Package } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function AddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    barcode: "",
    category: "cosmetic",
    ingredients: "",
  });

  useEffect(() => {
    // Pré-remplir avec les données d'OpenFoodFacts si disponibles
    const name = searchParams.get("name");
    const brand = searchParams.get("brand");
    const barcode = searchParams.get("barcode");
    const ingredients = searchParams.get("ingredients");

    if (name) setFormData(prev => ({ ...prev, name }));
    if (brand) setFormData(prev => ({ ...prev, brand }));
    if (barcode) setFormData(prev => ({ ...prev, barcode }));
    if (ingredients) setFormData(prev => ({ ...prev, ingredients }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convertir la chaîne d'ingrédients en tableau
      const ingredientsArray = formData.ingredients
        .split(",")
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);

      const { data, error } = await supabase
        .from("global_products")
        .insert({
          name: formData.name,
          brand: formData.brand || null,
          barcode: formData.barcode || null,
          category: formData.category,
          ingredients: ingredientsArray,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Produit ajouté !",
        description: "Le produit a été ajouté à la base de données",
      });

      navigate(`/product/${data.id}`);
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit. Vérifiez que vous êtes connecté.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl mt-20">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ajouter un produit
            </CardTitle>
            <CardDescription>
              Ajoutez un nouveau produit cosmétique à la base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Crème hydratante visage"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: L'Oréal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Code-barres</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Ex: 3600523456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: cosmetic, soin, maquillage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingrédients (séparés par des virgules) *</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="Ex: aqua, glycerin, cetyl alcohol, sodium hyaluronate"
                  rows={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Listez les ingrédients séparés par des virgules
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Ajout en cours..." : "Ajouter le produit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
