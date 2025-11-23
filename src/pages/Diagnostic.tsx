import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Droplet, Scissors, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Diagnostic = () => {
  const navigate = useNavigate();

  const diagnosticTypes = [
    {
      icon: Droplet,
      title: "Diagnostic Peau",
      description: "Identifiez votre type de peau et recevez des recommandations personnalisées",
      gradient: "gradient-primary",
      comingSoon: false,
    },
    {
      icon: Scissors,
      title: "Diagnostic Cheveux",
      description: "Déterminez votre profil capillaire pour une routine adaptée",
      gradient: "gradient-secondary",
      comingSoon: false,
    },
    {
      icon: Sparkles,
      title: "Diagnostic Beauté",
      description: "Routine beauté complète basée sur vos habitudes et objectifs",
      gradient: "bg-accent",
      comingSoon: false,
    },
  ];

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-medium">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Mes Diagnostics</h1>
            <p className="text-muted-foreground">
              Découvrez votre profil beauté unique grâce à nos diagnostics personnalisés
            </p>
          </div>

          {/* Diagnostic Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {diagnosticTypes.map((diagnostic, index) => (
              <Card
                key={index}
                className="shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-105 border-border/50 backdrop-blur-sm bg-card/95 overflow-hidden group"
              >
                <div className={`h-2 ${diagnostic.gradient}`}></div>
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${diagnostic.gradient} flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform`}>
                    <diagnostic.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{diagnostic.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {diagnostic.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group-hover:gradient-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all"
                    disabled={diagnostic.comingSoon}
                    onClick={() => {
                      if (index === 0) navigate("/diagnostic/peau");
                      if (index === 1) navigate("/diagnostic/cheveux");
                      if (index === 2) navigate("/diagnostic/beaute");
                    }}
                  >
                    {diagnostic.comingSoon ? "Bientôt disponible" : "Commencer"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Répondez au questionnaire</h3>
                  <p className="text-sm text-muted-foreground">
                    Quelques questions simples sur vos habitudes et caractéristiques
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Recevez votre profil</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyse détaillée de votre type de peau, cheveux ou routine beauté
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Obtenez vos recommandations</h3>
                  <p className="text-sm text-muted-foreground">
                    Routine personnalisée et ingrédients adaptés à vos besoins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
