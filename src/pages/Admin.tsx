import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, FlaskConical, Sparkles, ListChecks, Package } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      toast.error("Accès refusé : vous n'êtes pas administrateur");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <div className="animate-pulse">
          <ShieldCheck className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const adminSections = [
    {
      icon: FlaskConical,
      title: "Gestion des Ingrédients",
      description: "Ajouter, modifier ou supprimer des ingrédients de la base globale",
      gradient: "gradient-primary",
      comingSoon: false,
    },
    {
      icon: ListChecks,
      title: "Gestion des Routines",
      description: "Créer et gérer les routines peau, cheveux et beauté",
      gradient: "gradient-secondary",
      comingSoon: false,
    },
    {
      icon: Package,
      title: "Gestion des Produits",
      description: "Gérer les produits cosmétiques de la base globale",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      comingSoon: false,
    },
    {
      icon: Sparkles,
      title: "Paramètres Diagnostics",
      description: "Configurer les questions et résultats des diagnostics",
      gradient: "bg-accent",
      comingSoon: true,
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
              <ShieldCheck className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Administration</h1>
            <p className="text-muted-foreground">
              Gérez les données globales de l'application
            </p>
          </div>

          {/* Admin Sections */}
          <div className="grid md:grid-cols-3 gap-6">
            {adminSections.map((section, index) => (
              <Card
                key={index}
                onClick={() => {
                  if (!section.comingSoon) {
                    if (index === 0) navigate("/admin/ingredients");
                    if (index === 1) navigate("/admin/routines");
                    if (index === 2) navigate("/admin/products");
                  }
                }}
                className={`shadow-medium hover:shadow-strong transition-all duration-300 ${
                  !section.comingSoon ? "hover:scale-105 cursor-pointer" : "opacity-75"
                } border-border/50 backdrop-blur-sm bg-card/95 overflow-hidden group`}
              >
                <div className={`h-2 ${section.gradient}`}></div>
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${section.gradient} flex items-center justify-center mb-4 shadow-soft ${
                    !section.comingSoon ? "group-hover:scale-110" : ""
                  } transition-transform`}>
                    <section.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {section.comingSoon && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      Bientôt disponible
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Statistiques globales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Ingrédients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Routines</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Utilisateurs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
