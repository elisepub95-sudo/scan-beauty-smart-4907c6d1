import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Sun, Moon, Droplet, Scissors } from "lucide-react";

const Routine = () => {
  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-medium">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Ma Routine Beauté</h1>
            <p className="text-muted-foreground">
              Vos routines personnalisées basées sur vos diagnostics
            </p>
          </div>

          {/* Placeholder - No diagnostic yet */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune routine pour le moment</h3>
              <p className="text-muted-foreground mb-6">
                Commencez par faire un diagnostic pour recevoir votre routine personnalisée
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="text-sm">
                  <Droplet className="w-4 h-4 mr-1" />
                  Diagnostic Peau
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Scissors className="w-4 h-4 mr-1" />
                  Diagnostic Cheveux
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Diagnostic Beauté
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Example Routine Structure (hidden by default) */}
          <div className="hidden space-y-6">
            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle>Routine Matin</CardTitle>
                      <CardDescription>Routine peau personnalisée</CardDescription>
                    </div>
                  </div>
                  <Badge className="gradient-primary">Peau sèche</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Nettoyage doux</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisez un nettoyant doux sans sulfates pour préserver l'hydratation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-6 h-6 text-secondary" />
                    <div>
                      <CardTitle>Routine Soir</CardTitle>
                      <CardDescription>Routine peau personnalisée</CardDescription>
                    </div>
                  </div>
                  <Badge className="gradient-secondary">Peau sèche</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Démaquillage</h4>
                    <p className="text-sm text-muted-foreground">
                      Huile ou baume démaquillant pour enlever toutes les impuretés
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Routine;
