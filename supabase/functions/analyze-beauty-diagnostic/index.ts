import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosticId, answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const profilesData = {
      "anti-age": {
        profile: "anti-age",
        description: "Réduit l'apparence des rides, améliore la fermeté et la texture de la peau.",
        recommended_ingredients: ["rétinol", "peptides", "bakuchiol", "vitamine C", "niacinamide", "acide hyaluronique", "acides aminés"],
        ingredients_to_avoid: ["alcool dénaturé", "parfum", "gommages mécaniques agressifs"],
        routine: {
          morning: ["nettoyant doux", "vitamine C", "crème hydratante", "SPF 50"],
          evening: ["double nettoyage", "rétinol (progressif)", "crème nourrissante"],
          weekly: ["masque hydratant", "AHA doux"]
        }
      },
      "peau-sensible": {
        profile: "peau-sensible",
        description: "Apaise la peau et réduit les rougeurs et irritations.",
        recommended_ingredients: ["panthénol", "bisabolol", "centella asiatica", "aloe vera", "avoine colloïdale", "céramides"],
        ingredients_to_avoid: ["alcool", "parfum", "huiles essentielles", "AHA/BHA concentrés"],
        routine: {
          morning: ["nettoyant ultra doux", "sérum apaisant", "crème barrière", "SPF minéral"],
          evening: ["nettoyant doux", "sérum céramides", "crème riche sans parfum"],
          weekly: ["masque apaisant", "compresses d'avoine"]
        }
      },
      "anti-secheresse": {
        profile: "anti-secheresse",
        description: "Répare et nourrit les peaux sèches ou déshydratées.",
        recommended_ingredients: ["céramides", "acide hyaluronique", "squalane", "huile de jojoba", "glycérine", "beurre de karité"],
        ingredients_to_avoid: ["alcool dénaturé", "gels nettoyants agressifs"],
        routine: {
          morning: ["nettoyant crème", "sérum HA", "crème riche", "SPF 30+"],
          evening: ["double nettoyage doux", "huile nourrissante", "crème épaisse"],
          weekly: ["bain d'hydratation", "masque nourrissant"]
        }
      },
      "hydratation-intense": {
        profile: "hydratation-intense",
        description: "Redonne souplesse et hydratation à une peau déshydratée.",
        recommended_ingredients: ["acide hyaluronique", "panthénol", "glycérine", "aloe vera", "acides aminés"],
        ingredients_to_avoid: ["alcool", "acides exfoliants trop fréquents"],
        routine: {
          morning: ["brume hydratante", "sérum HA", "crème légère", "SPF"],
          evening: ["nettoyant hydratant", "sérum panthénol", "crème réparatrice"],
          weekly: ["masque hydratant", "sleeping mask"]
        }
      },
      "eclat": {
        profile: "eclat",
        description: "Illumine le teint, améliore l'uniformité et donne du glow.",
        recommended_ingredients: ["vitamine C", "niacinamide", "acide glycolique", "acide lactique", "acides de fruits AHA", "PHA"],
        ingredients_to_avoid: ["huiles minérales", "soins occlusifs lourds"],
        routine: {
          morning: ["nettoyant doux", "vitamine C", "crème légère", "SPF"],
          evening: ["nettoyant", "AHA léger 2–3x/semaine", "crème hydratante"],
          weekly: ["masque illuminateur"]
        }
      },
      "anti-acne": {
        profile: "anti-acne",
        description: "Purifie la peau, réduit les imperfections et régule le sébum.",
        recommended_ingredients: ["acide salicylique", "niacinamide", "benzoyl peroxide", "zinc PCA", "acide azélaïque", "probiotiques"],
        ingredients_to_avoid: ["huiles lourdes", "beurres riches", "silicones occlusifs"],
        routine: {
          morning: ["nettoyant purifiant", "niacinamide", "gel hydratant", "SPF matifiant"],
          evening: ["double nettoyage", "acide salicylique", "azélaïque"],
          weekly: ["masque purifiant", "gommage enzymatique"]
        }
      },
      "anti-taches": {
        profile: "anti-taches",
        description: "Réduit l'hyperpigmentation et harmonise le teint.",
        recommended_ingredients: ["vitamine C", "acide azélaïque", "niacinamide", "AHA", "arbutine", "retinol"],
        ingredients_to_avoid: ["soleil sans SPF", "gommages agressifs"],
        routine: {
          morning: ["vitamine C", "niacinamide", "SPF 50"],
          evening: ["nettoyant", "retinol ou azélaïque", "crème réparatrice"],
          weekly: ["peeling doux AHA"]
        }
      },
      "texture-lissee": {
        profile: "texture-lissee",
        description: "Lisse la texture, resserre les pores et améliore la douceur.",
        recommended_ingredients: ["niacinamide", "acide salicylique", "AHA", "PHA", "rétinol"],
        ingredients_to_avoid: ["crèmes trop grasses", "huiles lourdes"],
        routine: {
          morning: ["nettoyant doux", "niacinamide", "SPF"],
          evening: ["acide salicylique", "rétinol", "gel hydratant"],
          weekly: ["exfoliation chimique douce"]
        }
      },
      "apaisement": {
        profile: "apaisement",
        description: "Réduit rougeurs, inconfort et irritations.",
        recommended_ingredients: ["centella", "panthénol", "bisabolol", "céramides", "aloe vera"],
        ingredients_to_avoid: ["acides exfoliants", "rétinol", "parfum", "huiles essentielles"],
        routine: {
          morning: ["nettoyant doux", "sérum apaisant centella", "crème barrière", "SPF"],
          evening: ["nettoyage doux", "panthénol", "crème réparatrice"],
          weekly: ["masque apaisant"]
        }
      },
      "uniformite-teint": {
        profile: "uniformite-teint",
        description: "Lutte contre les zones ternes et irrégulières.",
        recommended_ingredients: ["niacinamide", "vitamine C", "PHA", "AHA", "arbutine"],
        ingredients_to_avoid: ["gommages physiques abrasifs"],
        routine: {
          morning: ["vitamine C", "hydratant", "SPF"],
          evening: ["PHA ou AHA", "crème réparatrice"],
          weekly: ["masque éclat"]
        }
      }
    };

    const prompt = `Tu es un expert en beauté et skincare. Analyse ce profil beauté et détermine quels profils beauté correspondent le mieux.

Réponses du questionnaire :
- Sommeil : ${answers.sleep}
- Hydratation : ${answers.hydration}
- Stress : ${answers.stress}
- Exposition soleil : ${answers.sunExposure}
- Environnement : ${answers.environment}
- Fréquence routine : ${answers.routineFrequency}
- Étapes routine : ${answers.routineSteps}
- Démaquillage : ${answers.makeupRemoval}
- Style produits : ${answers.productsStyle}
- Protection solaire : ${answers.spfUsage}
- Objectifs : ${answers.goals.join(", ")}
- Niveau connaissance : ${answers.knowledgeLevel}
- Aisance actifs : ${answers.activesComfort}

Règles de sélection :
- "Ralentir le vieillissement" → anti-age
- "Routine minimaliste" → routine simple (moins d'étapes)
- "Peau plus lumineuse" ou "joli teint naturel" → eclat
- Stress élevé ou sommeil < 6h → apaisement
- Hydratation faible → hydratation-intense ou anti-secheresse
- Exposition soleil élevée sans protection → anti-taches + uniformite-teint
- Débutant + routine 0-2 étapes → profils simples (minimaliste)
- Avancé + 5+ étapes → profils complexes possibles

Détermine 1 à 3 profils les plus adaptés parmi : anti-age, peau-sensible, anti-secheresse, hydratation-intense, eclat, anti-acne, anti-taches, texture-lissee, apaisement, uniformite-teint.

Détermine aussi une catégorie de profil parmi : Minimaliste, Débordée, Avancée/passionnée, Sensible/prudente, Glow addict, Anti-âge experte, Naturelle/green, Peu régulière/inconstante, Stressée/fatiguée, Exposée (soleil/pollution).

Retourne un JSON avec cette structure exacte (sans markdown) :
{
  "profile_category": "catégorie choisie",
  "selected_profiles": ["profil1", "profil2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu es un expert en beauté et skincare. Tu réponds uniquement en JSON valide, sans markdown." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      analysisResult = {
        profile_category: "Débutante",
        selected_profiles: ["hydratation-intense"]
      };
    }

    const selectedProfiles = analysisResult.selected_profiles
      .map((profileKey: string) => profilesData[profileKey as keyof typeof profilesData])
      .filter(Boolean);

    const result = {
      beauty_profile: {
        sleep: answers.sleep,
        hydration: answers.hydration,
        stress: answers.stress,
        sun_exposure: answers.sunExposure,
        environment: answers.environment,
        routine_frequency: answers.routineFrequency,
        routine_steps: answers.routineSteps,
        makeup_removal: answers.makeupRemoval,
        style: answers.productsStyle,
        ingredients_preference: answers.productsStyle,
        SPF_usage: answers.spfUsage,
        goals: answers.goals,
        knowledge_level: answers.knowledgeLevel,
        actives_comfort: answers.activesComfort,
        profile_category: analysisResult.profile_category,
      },
      profiles: selectedProfiles,
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/diagnostics?id=eq.${diagnosticId}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ result })
      });
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-beauty-diagnostic:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
