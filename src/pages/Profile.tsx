import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, LogOut, Save } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setUser(user);
    
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || "");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success("Profil mis à jour avec succès");
      loadProfile();
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      toast.success("Déconnexion réussie");
      navigate("/auth");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4 shadow-medium">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Mon Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles</p>
          </div>

          {/* Profile Info Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Membre depuis</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full gradient-primary hover:opacity-90 transition-smooth shadow-soft"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Mes statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Produits scannés</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Diagnostics</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Routines</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full md:hidden"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
