import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Adresse email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" }),
  password: z.string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(100, { message: "Le mot de passe ne peut pas dépasser 100 caractères" }),
  fullName: z.string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" })
    .optional()
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      const validation = authSchema.safeParse({
        email,
        password,
        fullName: isLogin ? undefined : fullName
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      const validatedData = validation.data;

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: validatedData.email, 
          password: validatedData.password 
        });
        if (error) throw error;
        toast.success("Connexion réussie !");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            data: { full_name: validatedData.fullName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Compte créé avec succès !");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-2 shadow-soft">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent gradient-primary">
            Scan & Know Beauty
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte beauté"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Votre nom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="transition-smooth"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-smooth"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="transition-smooth"
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-soft"
              disabled={loading}
            >
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-smooth"
            >
              {isLogin ? "Pas encore de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
