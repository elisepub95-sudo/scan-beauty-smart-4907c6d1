import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info, AlertCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface ProductAnalysisProps {
  productName: string;
  brand?: string;
  ingredients: string[];
  matchedIngredients: Array<{
    ingredient: string;
    data: Tables<"global_ingredients"> | null;
  }>;
}

const getDangerConfig = (level: string | null) => {
  switch (level) {
    case "0":
      return { label: "Sûr", color: "bg-green-500", icon: CheckCircle2, textColor: "text-green-700", bgColor: "bg-green-50" };
    case "1":
      return { label: "Attention", color: "bg-yellow-500", icon: Info, textColor: "text-yellow-700", bgColor: "bg-yellow-50" };
    case "2":
      return { label: "Modéré", color: "bg-orange-500", icon: AlertCircle, textColor: "text-orange-700", bgColor: "bg-orange-50" };
    case "3":
      return { label: "Élevé", color: "bg-red-500", icon: AlertTriangle, textColor: "text-red-700", bgColor: "bg-red-50" };
    default:
      return { label: "Non évalué", color: "bg-muted", icon: Info, textColor: "text-muted-foreground", bgColor: "bg-muted/20" };
  }
};

const ProductAnalysis = ({ productName, brand, ingredients, matchedIngredients }: ProductAnalysisProps) => {
  const dangerousIngredients = matchedIngredients.filter(
    m => m.data && (m.data.danger_level === "2" || m.data.danger_level === "3")
  );
  
  const safeIngredients = matchedIngredients.filter(
    m => m.data && (m.data.danger_level === "0" || m.data.danger_level === "1")
  );
  
  const unknownIngredients = matchedIngredients.filter(m => !m.data);

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader>
          <CardTitle className="text-2xl">{productName}</CardTitle>
          {brand && <CardDescription className="text-lg">{brand}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Total d'ingrédients :</span>
            <Badge variant="secondary">{ingredients.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Dangereux : {dangerousIngredients.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Sûrs : {safeIngredients.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted"></div>
              <span className="text-sm">Non évalués : {unknownIngredients.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dangerous Ingredients */}
      {dangerousIngredients.length > 0 && (
        <Card className="shadow-medium border-red-200 backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Ingrédients à risque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dangerousIngredients.map((item, idx) => {
              const config = getDangerConfig(item.data?.danger_level || null);
              const Icon = config.icon;
              
              return (
                <div key={idx} className={`p-4 rounded-lg ${config.bgColor}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className={`w-4 h-4 ${config.textColor}`} />
                      <span className="font-semibold">{item.ingredient}</span>
                    </div>
                    <Badge variant="outline" className={config.textColor}>
                      Niveau {item.data?.danger_level}
                    </Badge>
                  </div>
                  {item.data?.category && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium">Catégorie :</span> {item.data.category}
                    </p>
                  )}
                  {item.data?.description && (
                    <p className="text-sm text-muted-foreground">{item.data.description}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Safe Ingredients */}
      {safeIngredients.length > 0 && (
        <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Ingrédients sûrs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {safeIngredients.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm">
                  {item.ingredient}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unknown Ingredients */}
      {unknownIngredients.length > 0 && (
        <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-5 h-5" />
              Ingrédients non évalués
            </CardTitle>
            <CardDescription>
              Ces ingrédients ne sont pas encore dans notre base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unknownIngredients.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {item.ingredient}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductAnalysis;
