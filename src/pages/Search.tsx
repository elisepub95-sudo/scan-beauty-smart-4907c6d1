import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, Package, Beaker } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  ingredients: string[];
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  danger_level: string;
  description: string;
}

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setProducts([]);
        setIngredients([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Recherche de produits
      const { data: productsData } = await supabase
        .from("global_products")
        .select("*")
        .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,barcode.ilike.%${searchQuery}%`)
        .limit(10);

      // Recherche d'ingrédients
      const { data: ingredientsData } = await supabase
        .from("global_ingredients")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(10);

      setProducts(productsData || []);
      setIngredients(ingredientsData || []);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case "0":
        return "bg-green-500";
      case "1":
        return "bg-yellow-500";
      case "2":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDangerLabel = (level: string) => {
    switch (level) {
      case "0":
        return "Sûr";
      case "1":
        return "Modéré";
      case "2":
        return "Dangereux";
      default:
        return "Inconnu";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Recherche</h1>
          <p className="text-muted-foreground">
            Recherchez des produits cosmétiques ou des ingrédients
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un produit, code-barres ou ingrédient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Résultats */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">
              Produits ({products.length})
            </TabsTrigger>
            <TabsTrigger value="ingredients">
              Ingrédients ({ingredients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {loading ? (
              <p className="text-center text-muted-foreground">Recherche en cours...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery.trim().length >= 2
                    ? "Aucun produit trouvé"
                    : "Commencez à taper pour rechercher"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          )}
                          {product.barcode && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Code-barres: {product.barcode}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {product.ingredients?.length || 0} ingrédients
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            {loading ? (
              <p className="text-center text-muted-foreground">Recherche en cours...</p>
            ) : ingredients.length === 0 ? (
              <div className="text-center py-12">
                <Beaker className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery.trim().length >= 2
                    ? "Aucun ingrédient trouvé"
                    : "Commencez à taper pour rechercher"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ingredients.map((ingredient) => (
                  <Card
                    key={ingredient.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate(`/ingredient/${ingredient.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{ingredient.name}</h3>
                          {ingredient.category && (
                            <p className="text-sm text-muted-foreground">{ingredient.category}</p>
                          )}
                          {ingredient.description && (
                            <p className="text-sm mt-2 line-clamp-2">{ingredient.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getDangerColor(ingredient.danger_level)}`} />
                          <span className="text-sm font-medium">{getDangerLabel(ingredient.danger_level)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
