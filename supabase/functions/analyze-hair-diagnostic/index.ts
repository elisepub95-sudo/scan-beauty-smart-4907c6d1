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
    const { answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construire le contexte des réponses
    const context = `
Voici les réponses d'un utilisateur au diagnostic cheveux:

1. Épaisseur: ${answers.q1}
2. Texture: ${answers.q2}
3. Cuir chevelu: ${answers.q3}
4. État des cheveux: ${answers.q4}
5. Problèmes observés: ${answers.q5.join(", ") || "Aucun"}
6. Fréquence de lavage: ${answers.q6}
7. Outils/traitements utilisés: ${answers.q7.join(", ") || "Aucun"}
8. Environnement: ${answers.q8}
9. Objectifs: ${answers.q9.join(", ")}
10. Allergies: ${answers.q10}${answers.q10_other ? ` (${answers.q10_other})` : ""}

Analyse ce profil et génère une réponse JSON strictement formatée (pas de markdown, juste du JSON pur) avec cette structure exacte:

{
  "hair_type": {
    "thickness": "",
    "texture": "",
    "scalp": "",
    "global_type": ""
  },
  "current_condition": [],
  "habits": {
    "washing_frequency": "",
    "heat_tools": [],
    "chemical_treatments": [],
    "environment": ""
  },
  "goals": [],
  "sensitivities": [],
  "recommendations": {
    "ingredients_to_use": [],
    "ingredients_to_avoid": [],
    "routine": {
      "morning": [],
      "evening": [],
      "weekly": []
    }
  }
}

Remplis chaque champ avec des recommandations personnalisées basées sur le profil. Les tableaux doivent contenir des chaînes de caractères descriptives en français. Pour global_type, choisis parmi: "cheveux gras", "cheveux secs", "cheveux normaux", "cheveux sensibles", "cheveux mixtes".
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en soins capillaires. Analyse les réponses du questionnaire et génère des recommandations personnalisées. Réponds UNIQUEMENT avec du JSON valide, sans markdown ni formatage supplémentaire."
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes dépassée, veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Paiement requis, veuillez ajouter des crédits à votre compte Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let analysisResult = data.choices[0].message.content;

    // Nettoyer le markdown si présent
    analysisResult = analysisResult.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parser le JSON
    const parsedResult = JSON.parse(analysisResult);

    return new Response(
      JSON.stringify(parsedResult),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in analyze-hair-diagnostic:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'analyse" 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
