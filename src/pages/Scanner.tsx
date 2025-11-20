import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { searchProductByBarcode } from "@/services/openFoodFacts";
import { Camera, Search, X } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Scanner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      const qrCodeScanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(qrCodeScanner);
      
      await qrCodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          await handleBarcodeDetected(decodedText);
          stopScanner(qrCodeScanner);
        },
        () => {
          // Erreur normale pendant le scan
        }
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error("Erreur lors du démarrage du scanner:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive",
      });
    }
  };

  const stopScanner = async (scanner?: Html5Qrcode) => {
    const scannerToStop = scanner || html5QrCode;
    if (scannerToStop) {
      try {
        await scannerToStop.stop();
        scannerToStop.clear();
      } catch (err) {
        console.error("Erreur lors de l'arrêt du scanner:", err);
      }
    }
    setIsScanning(false);
    setHtml5QrCode(null);
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
              <div id="qr-reader" className={`${isScanning ? 'block' : 'hidden'} w-full`}></div>
              
              <div className="flex gap-2">
                {!isScanning ? (
                  <Button onClick={startScanner} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Démarrer le scanner
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
