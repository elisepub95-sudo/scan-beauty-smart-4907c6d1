import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Stethoscope, Trash2, Eye, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Diagnostic {
  id: string;
  user_id: string;
  type: string;
  answers: any;
  result: any;
  created_at: string;
  user_name?: string;
}

const AdminDiagnostics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || roleData?.role !== "admin") {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions pour accéder à cette page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadDiagnostics();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const { data: diagnosticsData, error } = await supabase
        .from("diagnostics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Charger les profils séparément
      const userIds = [...new Set(diagnosticsData?.map(d => d.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.id, p.full_name]) || []
      );

      const diagnosticsWithNames = diagnosticsData?.map(d => ({
        ...d,
        user_name: profilesMap.get(d.user_id) || "Utilisateur inconnu"
      })) || [];

      setDiagnostics(diagnosticsWithNames);
    } catch (error) {
      console.error("Error loading diagnostics:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les diagnostics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("diagnostics")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Diagnostic supprimé avec succès.",
      });

      await loadDiagnostics();
    } catch (error) {
      console.error("Error deleting diagnostic:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le diagnostic.",
        variant: "destructive",
      });
    }
  };

  const getDiagnosticTypeLabel = (type: string) => {
    switch (type) {
      case "skin":
        return "Peau";
      case "hair":
        return "Cheveux";
      case "beauty":
        return "Beauté";
      default:
        return type;
    }
  };

  const getDiagnosticTypeBadge = (type: string) => {
    const colors = {
      skin: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      hair: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      beauty: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500/10 text-gray-700 border-gray-500/20";
  };

  const filteredDiagnostics = selectedType === "all" 
    ? diagnostics 
    : diagnostics.filter(d => d.type === selectedType);

  const stats = {
    total: diagnostics.length,
    skin: diagnostics.filter(d => d.type === "skin").length,
    hair: diagnostics.filter(d => d.type === "hair").length,
    beauty: diagnostics.filter(d => d.type === "beauty").length,
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />

      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'admin
              </Button>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary shadow-medium">
                  <Stethoscope className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Gestion des Diagnostics</h1>
                  <p className="text-muted-foreground">
                    Consultez et gérez tous les diagnostics effectués
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-medium border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="shadow-medium border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Peau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.skin}</div>
              </CardContent>
            </Card>
            <Card className="shadow-medium border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cheveux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hair}</div>
              </CardContent>
            </Card>
            <Card className="shadow-medium border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Beauté</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.beauty}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des diagnostics */}
          <Card className="shadow-medium border-border/50">
            <CardHeader>
              <CardTitle>Liste des diagnostics</CardTitle>
              <CardDescription>
                Tous les diagnostics effectués par les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Tous ({stats.total})</TabsTrigger>
                  <TabsTrigger value="skin">Peau ({stats.skin})</TabsTrigger>
                  <TabsTrigger value="hair">Cheveux ({stats.hair})</TabsTrigger>
                  <TabsTrigger value="beauty">Beauté ({stats.beauty})</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedType}>
                  {loading ? (
                    <div className="text-center py-8">Chargement...</div>
                  ) : filteredDiagnostics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun diagnostic trouvé
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Résultat</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDiagnostics.map((diagnostic) => (
                            <TableRow key={diagnostic.id}>
                              <TableCell>
                                <Badge className={getDiagnosticTypeBadge(diagnostic.type)}>
                                  {getDiagnosticTypeLabel(diagnostic.type)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {diagnostic.user_name || "Utilisateur inconnu"}
                              </TableCell>
                              <TableCell>
                                {format(new Date(diagnostic.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                              </TableCell>
                              <TableCell>
                                {diagnostic.result ? (
                                  <Badge variant="secondary">Analysé</Badge>
                                ) : (
                                  <Badge variant="outline">En attente</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const route = diagnostic.type === "skin" 
                                        ? "/diagnostic/peau/resultats"
                                        : diagnostic.type === "hair"
                                        ? "/diagnostic/cheveux/resultats"
                                        : "/diagnostic/beaute/resultats";
                                      navigate(route, { state: { result: diagnostic.result } });
                                    }}
                                    disabled={!diagnostic.result}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer ce diagnostic ? Cette action est irréversible.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(diagnostic.id)}>
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDiagnostics;
