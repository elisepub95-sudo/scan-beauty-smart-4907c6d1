import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { searchProductByBarcode } from "@/services/openFoodFacts";
import { Camera, Search, X, Smartphone, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Scanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isNativePlatform, setIsNativePlatform] = useState(false);

  useEffect(() => {
    // Vérifier si on est sur une plateforme native (iOS ou Android)
    const platform = Capacitor.getPlatform();
    setIsNativePlatform(platform === 'ios' || platform === 'android');
  }, []);

  const checkPermission = async () => {
    const status = await BarcodeScanner.checkPermission({ force: true });
    return status.granted;
  };

  const startScanner = async () => {
    try {
      const hasPermission = await checkPermission();
      
      if (!hasPermission) {
        toast({
          title: "Permission refusée",
          description: "L'accès à la caméra est requis pour scanner les codes-barres",
          variant: "destructive",
        });
        return;
      }

      // Préparer le scanner
      await BarcodeScanner.prepare();
      
      // Masquer l'arrière-plan de l'application
      document.body.classList.add("scanner-active");
      
      setIsScanning(true);

      // Démarrer le scan
      const result = await BarcodeScanner.startScan();
      
      if (result.hasContent) {
        await handleBarcodeDetected(result.content || "");
      }
      
      stopScanner();
    } catch (err) {
      console.error("Erreur lors du démarrage du scanner:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive",
      });
      stopScanner();
    }
  };

  const stopScanner = async () => {
    document.body.classList.remove("scanner-active");
    await BarcodeScanner.stopScan();
    setIsScanning(false);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      const { data: existingProduct } = await supabase
        .from("global_products")
        .select("*")
        .eq("barcode", barcode)
        .maybeSingle();

      if (existingProduct) {
        navigate(`/product/${existingProduct.id}`);
        toast({
          title: "Produit trouvé",
          description: existingProduct.name,
        });
        return;
      }

      const productData = await searchProductByBarcode(barcode);
      
      if (productData && productData.product) {
        toast({
          title: "Produit trouvé sur OpenFoodFacts",
          description: `${productData.product.product_name || "Produit sans nom"}`,
        });
        
        toast({
          title: "Fonctionnalité à venir",
          description: "L'ajout de produits sera bientôt disponible",
        });
      } else {
        toast({
          title: "Produit non trouvé",
          description: "Ce produit n'existe pas dans notre base de données",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la recherche du produit:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Scanner de Produits</h1>
          <p className="text-muted-foreground">
            Scannez le code-barres d'un produit cosmétique pour analyser ses ingrédients
          </p>
        </div>

        {!isNativePlatform && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <Smartphone className="h-4 w-4" />
            <AlertTitle>Application mobile requise</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Le scanner de code-barres nécessite une application mobile native.</p>
              <p className="text-sm">
                Pour utiliser cette fonctionnalité :
              </p>
              <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
                <li>Exportez le projet vers GitHub</li>
                <li>Clonez le projet sur votre ordinateur</li>
                <li>Installez les dépendances avec <code className="bg-muted px-1 rounded">npm install</code></li>
                <li>Ajoutez la plateforme : <code className="bg-muted px-1 rounded">npx cap add android</code> ou <code className="bg-muted px-1 rounded">npx cap add ios</code></li>
                <li>Compilez : <code className="bg-muted px-1 rounded">npm run build</code></li>
                <li>Synchronisez : <code className="bg-muted px-1 rounded">npx cap sync</code></li>
                <li>Lancez l'app : <code className="bg-muted px-1 rounded">npx cap run android</code> ou <code className="bg-muted px-1 rounded">npx cap run ios</code></li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scanner avec la caméra
              </CardTitle>
              <CardDescription>
                Utilisez votre caméra pour scanner un code-barres
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full aspect-square max-w-md mx-auto bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center p-6">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isScanning 
                      ? "Positionnez le code-barres devant la caméra..." 
                      : "Cliquez sur le bouton ci-dessous pour activer la caméra"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isScanning ? (
                  <Button 
                    onClick={startScanner} 
                    className="w-full"
                    disabled={!isNativePlatform}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {isNativePlatform ? "Démarrer le scanner" : "Scanner non disponible (web)"}
                  </Button>
                ) : (
                  <Button onClick={() => stopScanner()} variant="destructive" className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Arrêter le scanner
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Recherche
              </CardTitle>
              <CardDescription>
                Recherchez un produit ou un ingrédient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/search')} 
                variant="outline" 
                className="w-full"
              >
                Ouvrir la recherche
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
