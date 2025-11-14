import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scan, Camera, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [ingredients, setIngredients] = useState("");

  const handleScan = () => {
    setScanning(true);
    // Simulation de scan
    setTimeout(() => {
      setScanning(false);
      toast.info("Fonctionnalité de scan en cours de développement");
    }, 1500);
  };

  const handleManualEntry = () => {
    if (!productName || !ingredients) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    toast.success("Produit analysé avec succès !");
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
                <Camera className="w-5 h-5 text-primary" />
                Scanner le code-barres
              </CardTitle>
              <CardDescription>
                Utilisez votre caméra pour scanner le code-barres du produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg gradient-subtle">
                <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Positionnez le code-barres devant la caméra
                </p>
                <Button
                  onClick={handleScan}
                  disabled={scanning}
                  className="gradient-primary hover:opacity-90 transition-smooth shadow-soft"
                >
                  {scanning ? "Scan en cours..." : "Activer la caméra"}
                </Button>
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
                className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-soft"
              >
                Analyser le produit
              </Button>
            </CardContent>
          </Card>

          {/* Danger Levels Info */}
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
        </div>
      </div>
    </div>
  );
};

export default Scanner;
