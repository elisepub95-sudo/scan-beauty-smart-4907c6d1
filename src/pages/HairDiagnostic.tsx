import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Scissors, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const formSchema = z.object({
  q1: z.string().min(1, "Veuillez sélectionner une réponse"),
  q2: z.string().min(1, "Veuillez sélectionner une réponse"),
  q3: z.string().min(1, "Veuillez sélectionner une réponse"),
  q4: z.string().min(1, "Veuillez sélectionner une réponse"),
  q5: z.array(z.string()).min(0),
  q6: z.string().min(1, "Veuillez sélectionner une réponse"),
  q7: z.array(z.string()).min(0),
  q8: z.string().min(1, "Veuillez sélectionner une réponse"),
  q9: z.array(z.string()).min(1, "Veuillez sélectionner au moins un objectif"),
  q10: z.string().min(1, "Veuillez sélectionner une réponse"),
  q10_other: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const HairDiagnostic = () => {
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
      q5: [],
      q6: "",
      q7: [],
      q8: "",
      q9: [],
      q10: "",
      q10_other: "",
    },
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      // Appel à l'edge function pour analyser avec IA
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-hair-diagnostic',
        { body: { answers: values } }
      );

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        toast.error("Erreur lors de l'analyse IA");
        return;
      }

      // Sauvegarder dans la base de données
      const { error } = await supabase.from("diagnostics").insert({
        user_id: user.id,
        type: "cheveux",
        answers: values,
        result: analysisData,
      });

      if (error) throw error;

      toast.success("Diagnostic enregistré avec succès !");
      navigate("/diagnostic/cheveux/resultats", { state: { result: analysisData } });
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
      case 5:
        return ["q10"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-secondary mb-4 shadow-medium">
              <Scissors className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Diagnostic Cheveux</h1>
            <p className="text-muted-foreground mb-4">
              Répondez aux questions pour découvrir votre profil capillaire
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
                  {/* Step 1: Type de cheveux */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Type de cheveux</h2>
                      
                      <FormField
                        control={form.control}
                        name="q1"
                        render={({ field }) => (
                          <FormItem className="space-y-3 mb-6">
                            <FormLabel className="text-base font-medium">
                              Comment décrirais-tu l'aspect général de tes cheveux ?
                            </FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="tres_fins" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Très fins</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="fins" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Fins</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="normaux" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Normaux</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="epais" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Épais</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="tres_epais" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Très épais</FormLabel>
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
                              Ton cheveu naturel est plutôt :
                            </FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="lisse" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Lisse</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="ondule" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Ondulé</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="boucle" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Bouclé</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="crepu" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Crépu</FormLabel>
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
                              Ton cuir chevelu est :
                            </FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="sec" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Sec</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="normal" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Normal</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="gras" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Gras</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="sensible" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Sensible / irrité</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="pelliculaire" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Pelliculaire</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: État actuel */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">État actuel</h2>
                      
                      <FormField
                        control={form.control}
                        name="q4"
                        render={({ field }) => (
                          <FormItem className="space-y-3 mb-6">
                            <FormLabel className="text-base font-medium">
                              Tes cheveux sont…
                            </FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="tres_secs" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Très secs</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="legerement_secs" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Légèrement secs</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="normaux" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Normaux</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="gras" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Gras</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="tres_gras" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Très gras</FormLabel>
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
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base font-medium mb-3 block">
                              Observes-tu des problèmes ? (plusieurs réponses possibles)
                            </FormLabel>
                            <div className="space-y-2">
                              {[
                                { id: "casse", label: "Casse" },
                                { id: "frisottis", label: "Frisottis" },
                                { id: "manque_volume", label: "Manque de volume" },
                                { id: "perte", label: "Perte de cheveux" },
                                { id: "fourches", label: "Fourches" },
                                { id: "pellicules", label: "Pellicules" },
                                { id: "irritation", label: "Irritation / démangeaisons" },
                                { id: "exces_sebum", label: "Excès de sébum" },
                                { id: "aucun", label: "Aucun" },
                              ].map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name="q5"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(field.value?.filter((value) => value !== item.id));
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 3: Habitudes */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Habitudes / environnement</h2>
                      
                      <FormField
                        control={form.control}
                        name="q6"
                        render={({ field }) => (
                          <FormItem className="space-y-3 mb-6">
                            <FormLabel className="text-base font-medium">
                              À quelle fréquence laves-tu tes cheveux ?
                            </FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="tous_jours" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Tous les jours</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="2_jours" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Tous les 2 jours</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="3_jours" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Tous les 3 jours</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="semaine" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Une fois par semaine</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="moins_semaine" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Moins d'une fois par semaine</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="q7"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base font-medium mb-3 block">
                              Utilises-tu : (plusieurs réponses possibles)
                            </FormLabel>
                            <div className="space-y-2">
                              {[
                                { id: "lisseur", label: "Lisseur" },
                                { id: "fer_boucler", label: "Fer à boucler" },
                                { id: "seche_cheveux", label: "Sèche-cheveux" },
                                { id: "extensions", label: "Extensions" },
                                { id: "decoloration", label: "Décoloration" },
                                { id: "coloration", label: "Coloration" },
                                { id: "lissage_bresilien", label: "Lissage brésilien / tanin" },
                              ].map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name="q7"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(field.value?.filter((value) => value !== item.id));
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 4: Objectifs + Environnement */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Objectifs & Environnement</h2>
                      
                      <FormField
                        control={form.control}
                        name="q8"
                        render={({ field }) => (
                          <FormItem className="space-y-3 mb-6">
                            <FormLabel className="text-base font-medium">
                              Quelle est la météo de ton environnement ?
                            </FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="tres_humide" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Très humide</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="humide" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Humide</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="sec" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Sec</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="tres_sec" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Très sec</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="q9"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base font-medium mb-3 block">
                              Quels sont tes objectifs cheveux ? (plusieurs réponses possibles)
                            </FormLabel>
                            <div className="space-y-2">
                              {[
                                { id: "hydratation", label: "Hydratation" },
                                { id: "nutrition", label: "Nutrition" },
                                { id: "volume", label: "Volume" },
                                { id: "anti_casse", label: "Anti-casse" },
                                { id: "lutte_chute", label: "Lutte contre la chute" },
                                { id: "lutte_pellicules", label: "Lutte contre les pellicules" },
                                { id: "reduction_sebum", label: "Réduction du sébum" },
                                { id: "definition_boucles", label: "Définition des boucles" },
                                { id: "lissage_discipline", label: "Lissage / discipline" },
                                { id: "brillance", label: "Brillance" },
                              ].map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name="q9"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(field.value?.filter((value) => value !== item.id));
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 5: Sensibilités */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-4">Sensibilités</h2>
                      
                      <FormField
                        control={form.control}
                        name="q10"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-medium">
                              As-tu des allergies connues ?
                            </FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="non" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Non</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="oui" /></FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Oui</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("q10") === "oui" && (
                        <FormField
                          control={form.control}
                          name="q10_other"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Précisez l'ingrédient ou la famille :</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: silicones, sulfates..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation buttons */}
              <div className="flex justify-between gap-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                )}
                
                {step < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="flex-1 ml-auto">
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="flex-1 ml-auto">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      "Obtenir mon diagnostic"
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

export default HairDiagnostic;
