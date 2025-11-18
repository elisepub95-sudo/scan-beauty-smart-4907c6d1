import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";
import { z } from "zod";

const routineSchema = z.object({
  title: z.string()
    .trim()
    .min(2, { message: "Le titre doit contenir au moins 2 caractères" })
    .max(200, { message: "Le titre ne peut pas dépasser 200 caractères" }),
  description: z.string()
    .trim()
    .max(1000, { message: "La description ne peut pas dépasser 1000 caractères" })
    .optional(),
  step: z.string()
    .trim()
    .min(1, { message: "L'étape est requise" })
    .max(100, { message: "L'étape ne peut pas dépasser 100 caractères" }),
  routine_type: z.string()
    .trim()
    .min(1, { message: "Le type de routine est requis" })
    .max(50, { message: "Le type ne peut pas dépasser 50 caractères" }),
  order_index: z.number().int().min(0).optional(),
  recommended_for: z.array(z.string().trim().max(100)).optional()
});

const AdminRoutines = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<Tables<"routines">[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    step: "",
    routine_type: "",
    order_index: 0,
    recommended_for: ""
  });
  const [submitting, setSubmitting] = useState(false);

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
      navigate("/admin");
      return;
    }

    setIsAdmin(true);
    await fetchRoutines();
    setLoading(false);
  };

  const fetchRoutines = async () => {
    const { data, error } = await supabase
      .from("routines")
      .select("*")
      .order("routine_type")
      .order("order_index");

    if (error) {
      toast.error("Erreur lors du chargement des routines");
      console.error(error);
      return;
    }

    setRoutines(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const recommendedForArray = formData.recommended_for
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const validation = routineSchema.safeParse({
      title: formData.title,
      description: formData.description || undefined,
      step: formData.step,
      routine_type: formData.routine_type,
      order_index: formData.order_index,
      recommended_for: recommendedForArray.length > 0 ? recommendedForArray : undefined
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);

    try {
      const dataToSubmit = {
        title: validation.data.title,
        description: validation.data.description || null,
        step: validation.data.step,
        routine_type: validation.data.routine_type,
        order_index: validation.data.order_index || 0,
        recommended_for: validation.data.recommended_for || null
      };

      if (editingId) {
        const { error } = await supabase
          .from("routines")
          .update(dataToSubmit)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Routine modifiée avec succès");
      } else {
        const { error } = await supabase
          .from("routines")
          .insert(dataToSubmit);

        if (error) throw error;
        toast.success("Routine ajoutée avec succès");
      }

      resetForm();
      await fetchRoutines();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (routine: Tables<"routines">) => {
    setEditingId(routine.id);
    setFormData({
      title: routine.title,
      description: routine.description || "",
      step: routine.step,
      routine_type: routine.routine_type,
      order_index: routine.order_index || 0,
      recommended_for: routine.recommended_for?.join(", ") || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("routines")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success("Routine supprimée avec succès");
      await fetchRoutines();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      step: "",
      routine_type: "",
      order_index: 0,
      recommended_for: ""
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen gradient-subtle pb-24 md:pt-24">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/admin")}
              className="shadow-soft"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-medium">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Gestion des Routines</h1>
              </div>
              <p className="text-muted-foreground ml-15">
                Gérez les routines de soins personnalisées
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? "Modifier la routine" : "Ajouter une routine"}
              </CardTitle>
              <CardDescription>
                {editingId ? "Modifiez les informations de la routine" : "Ajoutez une nouvelle routine de soins"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Nettoyage doux du visage"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="step">Étape *</Label>
                    <Input
                      id="step"
                      placeholder="Ex: Matin"
                      value={formData.step}
                      onChange={(e) => setFormData({ ...formData, step: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routine_type">Type de routine *</Label>
                    <Input
                      id="routine_type"
                      placeholder="Ex: Hydratation"
                      value={formData.routine_type}
                      onChange={(e) => setFormData({ ...formData, routine_type: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order_index">Ordre</Label>
                    <Input
                      id="order_index"
                      type="number"
                      min="0"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommended_for">Recommandé pour (séparé par des virgules)</Label>
                  <Input
                    id="recommended_for"
                    placeholder="Ex: Peau sèche, Peau sensible"
                    value={formData.recommended_for}
                    onChange={(e) => setFormData({ ...formData, recommended_for: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description de la routine, instructions d'utilisation..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="gradient-primary hover:opacity-90 transition-smooth shadow-soft"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {editingId ? "Modifier" : "Ajouter"}
                      </>
                    )}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Routines List */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Liste des routines ({routines.length})</CardTitle>
              <CardDescription>
                Toutes les routines enregistrées dans la base de données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Étape</TableHead>
                      <TableHead>Ordre</TableHead>
                      <TableHead>Recommandé pour</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Aucune routine enregistrée
                        </TableCell>
                      </TableRow>
                    ) : (
                      routines.map((routine) => (
                        <TableRow key={routine.id}>
                          <TableCell className="font-medium">{routine.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{routine.routine_type}</Badge>
                          </TableCell>
                          <TableCell>{routine.step}</TableCell>
                          <TableCell>{routine.order_index}</TableCell>
                          <TableCell>
                            {routine.recommended_for && routine.recommended_for.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {routine.recommended_for.map((item, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(routine)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDeleteId(routine.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette routine ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRoutines;
