import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BeautyDiagnostic = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answers, setAnswers] = useState({
    sleep: "",
    hydration: "",
    stress: "",
    sunExposure: "",
    environment: "",
    routineFrequency: "",
    routineSteps: "",
    makeupRemoval: "",
    productsStyle: "",
    spfUsage: "",
    goals: [] as string[],
    knowledgeLevel: "",
    activesComfort: "",
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleGoal = (goal: string) => {
    setAnswers(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer un diagnostic.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: diagnosticData, error: insertError } = await supabase
        .from("diagnostics")
        .insert({
          user_id: user.id,
          type: "beauty",
          answers: answers,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "analyze-beauty-diagnostic",
        {
          body: { diagnosticId: diagnosticData.id, answers },
        }
      );

      if (functionError) throw functionError;

      navigate("/diagnostic/beaute/resultats", {
        state: { result: functionData.result },
      });
    } catch (error) {
      console.error("Error submitting beauty diagnostic:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'analyse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />

      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-medium">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Diagnostic Beauté</h1>
            <p className="text-muted-foreground">
              Découvrez votre profil beauté et votre routine idéale
            </p>
          </div>

          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Étape {step} sur {totalSteps}
            </p>
          </div>

          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>
                {step === 1 && "Habitudes & Mode de vie"}
                {step === 2 && "Habitudes Beauté"}
                {step === 3 && "Objectifs Beauté"}
                {step === 4 && "Niveau de Connaissance"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Parlez-nous de votre quotidien"}
                {step === 2 && "Vos habitudes de soin"}
                {step === 3 && "Vos objectifs beauté"}
                {step === 4 && "Votre expertise en skincare"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-3">
                    <Label>Combien d'heures dormez-vous par nuit ?</Label>
                    <RadioGroup value={answers.sleep} onValueChange={(v) => setAnswers({ ...answers, sleep: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="<6h" id="sleep1" />
                        <Label htmlFor="sleep1">Moins de 6h</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6-8h" id="sleep2" />
                        <Label htmlFor="sleep2">6-8h</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="8h+" id="sleep3" />
                        <Label htmlFor="sleep3">Plus de 8h</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Hydratation quotidienne (eau) :</Label>
                    <RadioGroup value={answers.hydration} onValueChange={(v) => setAnswers({ ...answers, hydration: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="<1L" id="hydra1" />
                        <Label htmlFor="hydra1">Moins de 1L</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1-1.5L" id="hydra2" />
                        <Label htmlFor="hydra2">1-1.5L</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2L+" id="hydra3" />
                        <Label htmlFor="hydra3">2L ou plus</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Niveau de stress :</Label>
                    <RadioGroup value={answers.stress} onValueChange={(v) => setAnswers({ ...answers, stress: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="faible" id="stress1" />
                        <Label htmlFor="stress1">Faible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moyen" id="stress2" />
                        <Label htmlFor="stress2">Moyen</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eleve" id="stress3" />
                        <Label htmlFor="stress3">Élevé</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Exposition au soleil :</Label>
                    <RadioGroup value={answers.sunExposure} onValueChange={(v) => setAnswers({ ...answers, sunExposure: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tres-faible" id="sun1" />
                        <Label htmlFor="sun1">Très faible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderee" id="sun2" />
                        <Label htmlFor="sun2">Modérée</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="elevee" id="sun3" />
                        <Label htmlFor="sun3">Élevée</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quotidienne-sans-protection" id="sun4" />
                        <Label htmlFor="sun4">Quotidienne sans protection</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Environnement :</Label>
                    <RadioGroup value={answers.environment} onValueChange={(v) => setAnswers({ ...answers, environment: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ville" id="env1" />
                        <Label htmlFor="env1">Ville / Pollution</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="campagne" id="env2" />
                        <Label htmlFor="env2">Campagne</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mer" id="env3" />
                        <Label htmlFor="env3">Bord de mer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="montagne" id="env4" />
                        <Label htmlFor="env4">Montagne</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-3">
                    <Label>À quelle fréquence suivez-vous une routine beauté ?</Label>
                    <RadioGroup value={answers.routineFrequency} onValueChange={(v) => setAnswers({ ...answers, routineFrequency: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jamais" id="freq1" />
                        <Label htmlFor="freq1">Jamais</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="occasionnellement" id="freq2" />
                        <Label htmlFor="freq2">Occasionnellement</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regulierement" id="freq3" />
                        <Label htmlFor="freq3">Régulièrement</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tous-les-jours" id="freq4" />
                        <Label htmlFor="freq4">Tous les jours</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Combien d'étapes contient votre routine ?</Label>
                    <RadioGroup value={answers.routineSteps} onValueChange={(v) => setAnswers({ ...answers, routineSteps: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="steps1" />
                        <Label htmlFor="steps1">0</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1-2" id="steps2" />
                        <Label htmlFor="steps2">1 à 2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3-4" id="steps3" />
                        <Label htmlFor="steps3">3 à 4</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5+" id="steps4" />
                        <Label htmlFor="steps4">5 ou plus</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>À quelle fréquence vous démaquillez-vous ?</Label>
                    <RadioGroup value={answers.makeupRemoval} onValueChange={(v) => setAnswers({ ...answers, makeupRemoval: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jamais" id="makeup1" />
                        <Label htmlFor="makeup1">Jamais</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parfois" id="makeup2" />
                        <Label htmlFor="makeup2">Parfois</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tous-les-soirs" id="makeup3" />
                        <Label htmlFor="makeup3">Tous les soirs</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Vous utilisez principalement :</Label>
                    <RadioGroup value={answers.productsStyle} onValueChange={(v) => setAnswers({ ...answers, productsStyle: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="naturels" id="prod1" />
                        <Label htmlFor="prod1">Produits naturels</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="conventionnels" id="prod2" />
                        <Label htmlFor="prod2">Produits conventionnels</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="melange" id="prod3" />
                        <Label htmlFor="prod3">Mélange des deux</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ne-sais-pas" id="prod4" />
                        <Label htmlFor="prod4">Je ne sais pas</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Utilisez-vous une protection solaire ?</Label>
                    <RadioGroup value={answers.spfUsage} onValueChange={(v) => setAnswers({ ...answers, spfUsage: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non" id="spf1" />
                        <Label htmlFor="spf1">Non</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ete" id="spf2" />
                        <Label htmlFor="spf2">Seulement en été</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="souvent" id="spf3" />
                        <Label htmlFor="spf3">Souvent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tous-les-jours" id="spf4" />
                        <Label htmlFor="spf4">Tous les jours</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <Label>Quels sont vos objectifs ? (plusieurs choix possibles)</Label>
                  <div className="space-y-2">
                    {[
                      "Avoir une peau plus lumineuse",
                      "Ralentir le vieillissement",
                      "Diminuer le stress / améliorer le sommeil",
                      "Avoir un joli teint naturel",
                      "Routine minimaliste",
                      "Routine efficace",
                      "Améliorer régularité / motivation"
                    ].map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={answers.goals.includes(goal)}
                          onCheckedChange={() => toggleGoal(goal)}
                        />
                        <Label htmlFor={goal} className="font-normal cursor-pointer">
                          {goal}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-3">
                    <Label>Comment évaluez-vous vos connaissances en skincare ?</Label>
                    <RadioGroup value={answers.knowledgeLevel} onValueChange={(v) => setAnswers({ ...answers, knowledgeLevel: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="debutant" id="know1" />
                        <Label htmlFor="know1">Débutant(e)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intermediaire" id="know2" />
                        <Label htmlFor="know2">Intermédiaire</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="avance" id="know3" />
                        <Label htmlFor="know3">Avancé(e)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Êtes-vous à l'aise avec les actifs ?</Label>
                    <RadioGroup value={answers.activesComfort} onValueChange={(v) => setAnswers({ ...answers, activesComfort: v })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pas-du-tout" id="actives1" />
                        <Label htmlFor="actives1">Pas du tout</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quelques-notions" id="actives2" />
                        <Label htmlFor="actives2">Quelques notions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tres-a-laise" id="actives3" />
                        <Label htmlFor="actives3">Très à l'aise</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-6">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button onClick={handleNext} className="flex-1">
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Analyse en cours..." : "Voir mes résultats"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeautyDiagnostic;
