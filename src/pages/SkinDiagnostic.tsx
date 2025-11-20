import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplet, ArrowLeft, ArrowRight, Check } from "lucide-react";

const formSchema = z.object({
  q1: z.string().min(1, "Veuillez sélectionner une réponse"),
  q2: z.string().min(1, "Veuillez sélectionner une réponse"),
  q3: z.string().min(1, "Veuillez sélectionner une réponse"),
  q4: z.string().min(1, "Veuillez sélectionner une réponse"),
  q5: z.string().min(1, "Veuillez sélectionner une réponse"),
  q6: z.array(z.string()).min(1, "Veuillez sélectionner au moins un objectif"),
  q7: z.string().min(1, "Veuillez sélectionner une réponse"),
  q8: z.array(z.string()),
  q8_other: z.string().optional(),
  q9: z.string().min(1, "Veuillez sélectionner une réponse"),
});

type FormValues = z.infer<typeof formSchema>;

const SkinDiagnostic = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      q6: [],
      q7: "",
      q8: [],
      q8_other: "",
      q9: "",
    },
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const calculateResult = (values: FormValues) => {
    // Calcul du type de peau basé sur q1, q2, q3
    const skinTypeAnswers = [values.q1, values.q2, values.q3];
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    skinTypeAnswers.forEach(answer => {
      counts[answer as keyof typeof counts]++;
    });
    const maxCount = Math.max(...Object.values(counts));
    const dominantAnswer = Object.keys(counts).find(
      key => counts[key as keyof typeof counts] === maxCount
    );

    const skinTypeMap: Record<string, string> = {
      A: "sèche",
      B: "mixte",
      C: "grasse",
      D: "normale",
      E: "sensible",
    };

    const type_peau = skinTypeMap[dominantAnswer || "D"];

    // État de la peau basé sur q4
    const etatPeauMap: Record<string, string> = {
      A: "déshydratée",
      B: "terne",
      C: "irritée",
      D: "acnéique",
      E: "mature",
    };
    const etat_peau = etatPeauMap[values.q4];

    // Objectifs basés sur q6
    const objectifsMap: Record<string, string> = {
      A: "hydratation",
      B: "éclat",
      C: "anti-âge",
      D: "anti-taches",
      E: "anti-acné",
    };
    const objectifs = values.q6.map(obj => objectifsMap[obj]);

    // Sensibilités basées sur q8
    const sensibilitesMap: Record<string, string> = {
      A: "parfum",
      B: "huiles essentielles",
      C: "alcool",
      D: "aucune",
    };
    const sensibilites = values.q8.map(sens => sensibilitesMap[sens]);
    if (values.q8_other) {
      sensibilites.push(values.q8_other);
    }

    return {
      type_peau,
      etat_peau,
      objectifs,
      sensibilites,
      niveau_sensibilite: values.q9,
      budget: values.q7,
      reaction_produits: values.q5,
    };
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      const result = calculateResult(values);

      const { error } = await supabase.from("diagnostics").insert({
        user_id: user.id,
        type: "peau",
        answers: values,
        result,
      });

      if (error) throw error;

        toast.success("Diagnostic enregistré avec succès !");
        navigate("/diagnostic/peau/resultats");
    } catch (error) {
      console.error("Error saving diagnostic:", error);
      toast.error("Erreur lors de l'enregistrement du diagnostic");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = getStepFields(step);
    const isValid = await form.trigger(fields);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const getStepFields = (currentStep: number): (keyof FormValues)[] => {
    switch (currentStep) {
      case 1:
        return ["q1", "q2", "q3"];
      case 2:
        return ["q4", "q5"];
      case 3:
        return ["q6", "q7"];
      case 4:
        return ["q8", "q9"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-medium">
              <Droplet className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Diagnostic Peau</h1>
            <p className="text-muted-foreground mb-4">
              Répondez aux questions pour découvrir votre profil de peau
            </p>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Étape {step} sur {totalSteps}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
                <CardContent className="pt-6">
                  {/* Step 1: Type de peau */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Identification du type de peau</h2>
                        
                        <FormField
                          control={form.control}
                          name="q1"
                          render={({ field }) => (
                            <FormItem className="space-y-3 mb-6">
                              <FormLabel className="text-base font-medium">
                                Comment se comporte ta peau en fin de journée ?
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="A" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Tiraille, sèche
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="B" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Brille sur la zone T
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="C" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Brille partout
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="D" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Ne brille pas mais n'est pas sèche non plus
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="E" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Rougit facilement, démange, réagit vite
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="q2"
                          render={({ field }) => (
                            <FormItem className="space-y-3 mb-6">
                              <FormLabel className="text-base font-medium">
                                Comment ressens-tu ta peau après la douche ?
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="A" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Très sèche / tiraillements
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="B" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Légers tiraillements
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="C" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Gras / brillant
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="D" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Normale
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="E" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Sensible / picotements
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="q3"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-medium">
                                À quelle fréquence as-tu des imperfections ?
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="A" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Jamais
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="B" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Parfois sur le menton
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="C" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Souvent, plusieurs zones
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="D" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Rarement
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="E" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Souvent en réaction à un produit
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: État de la peau */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-4">État actuel de la peau</h2>
                        
                        <FormField
                          control={form.control}
                          name="q4"
                          render={({ field }) => (
                            <FormItem className="space-y-3 mb-6">
                              <FormLabel className="text-base font-medium">
                                Comment décrirais-tu l'apparence de ta peau ?
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="A" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Déshydratée
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="B" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Terne
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="C" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Rougeurs / irritée
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="D" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Acnéique
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="E" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Mature / ridules
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="q5"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-medium">
                                Comment ta peau réagit-elle à de nouveaux produits ?
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="A" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Très sensible
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="B" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Normalement
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="C" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Réactions fortes (rougeurs, brûlures)
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="D" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Pas de réaction
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="E" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Légère sensibilité
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Objectifs et budget */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Objectifs Beauté</h2>
                        
                        <FormField
                          control={form.control}
                          name="q6"
                          render={() => (
                            <FormItem className="mb-6">
                              <FormLabel className="text-base font-medium">
                                Quels sont tes objectifs principaux ? (Plusieurs choix possibles)
                              </FormLabel>
                              <div className="space-y-2 mt-3">
                                {[
                                  { id: "A", label: "Hydratation" },
                                  { id: "B", label: "Éclat / luminosité" },
                                  { id: "C", label: "Anti-âge" },
                                  { id: "D", label: "Anti-taches" },
                                  { id: "E", label: "Anti-acné / imperfections" },
                                ].map((item) => (
                                  <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="q6"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={item.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(item.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, item.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== item.id
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
                                            {item.label}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="q7"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-medium">
                                Quel est ton budget soins ?
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="A" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Faible
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="B" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Moyen
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="C" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Élevé
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Sensibilités */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Sensibilités et allergies</h2>
                        
                        <FormField
                          control={form.control}
                          name="q8"
                          render={() => (
                            <FormItem className="mb-6">
                              <FormLabel className="text-base font-medium">
                                As-tu une allergie connue ? (Plusieurs choix possibles)
                              </FormLabel>
                              <div className="space-y-2 mt-3">
                                {[
                                  { id: "A", label: "Parfum" },
                                  { id: "B", label: "Huiles essentielles" },
                                  { id: "C", label: "Alcool" },
                                  { id: "D", label: "Aucun" },
                                ].map((item) => (
                                  <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="q8"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={item.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(item.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, item.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== item.id
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
                                            {item.label}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="q8_other"
                          render={({ field }) => (
                            <FormItem className="mb-6">
                              <FormLabel>Autre allergie (si applicable)</FormLabel>
                              <FormControl>
                                <Input placeholder="Précisez..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="q9"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-medium">
                                Quel est ton niveau de sensibilité ?
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="A" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Très sensible
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="B" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Peu sensible
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="C" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Pas sensible du tout
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation buttons */}
              <div className="flex gap-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Précédent
                  </Button>
                )}
                
                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 gradient-primary"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gradient-primary"
                  >
                    {isSubmitting ? (
                      "Enregistrement..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Terminer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SkinDiagnostic;
