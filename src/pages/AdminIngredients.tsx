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
import { FlaskConical, Plus, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";
import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(200, { message: "Le nom ne peut pas dépasser 200 caractères" }),
  category: z.string()
    .trim()
    .max(100, { message: "La catégorie ne peut pas dépasser 100 caractères" })
    .optional(),
  description: z.string()
    .trim()
    .max(1000, { message: "La description ne peut pas dépasser 1000 caractères" })
    .optional(),
  danger_level: z.enum(["0", "1", "2", "3"])
});

const AdminIngredients = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Tables<"global_ingredients">[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    danger_level: "0" as "0" | "1" | "2" | "3"
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
    await fetchIngredients();
    setLoading(false);
  };

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from("global_ingredients")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erreur lors du chargement des ingrédients");
      console.error(error);
      return;
    }

    setIngredients(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = ingredientSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);

    try {
      const dataToSubmit = {
        name: validation.data.name,
        category: validation.data.category || null,
        description: validation.data.description || null,
        danger_level: validation.data.danger_level
      };

      if (editingId) {
        const { error } = await supabase
          .from("global_ingredients")
          .update(dataToSubmit)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Ingrédient modifié avec succès");
      } else {
        const { error } = await supabase
          .from("global_ingredients")
          .insert(dataToSubmit);

        if (error) throw error;
        toast.success("Ingrédient ajouté avec succès");
      }

      resetForm();
      await fetchIngredients();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ingredient: Tables<"global_ingredients">) => {
    setEditingId(ingredient.id);
    setFormData({
      name: ingredient.name,
      category: ingredient.category || "",
      description: ingredient.description || "",
      danger_level: ingredient.danger_level || "0"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("global_ingredients")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success("Ingrédient supprimé avec succès");
      await fetchIngredients();
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
      name: "",
      category: "",
      description: "",
      danger_level: "0"
    });
  };

  const dangerLevelLabels = {
    "0": { label: "Sûr", color: "bg-green-500" },
    "1": { label: "Attention", color: "bg-yellow-500" },
    "2": { label: "Modéré", color: "bg-orange-500" },
    "3": { label: "Élevé", color: "bg-red-500" }
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
                  <FlaskConical className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Gestion des Ingrédients</h1>
              </div>
              <p className="text-muted-foreground ml-15">
                Gérez la base de données des ingrédients cosmétiques
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? "Modifier l'ingrédient" : "Ajouter un ingrédient"}
              </CardTitle>
              <CardDescription>
                {editingId ? "Modifiez les informations de l'ingrédient" : "Ajoutez un nouvel ingrédient à la base de données"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'ingrédient *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Aqua"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      placeholder="Ex: Hydratant"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="danger_level">Niveau de danger *</Label>
                  <Select
                    value={formData.danger_level}
                    onValueChange={(value) => setFormData({ ...formData, danger_level: value as "0" | "1" | "2" | "3" })}
                  >
                    <SelectTrigger id="danger_level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - Sûr</SelectItem>
                      <SelectItem value="1">1 - Attention</SelectItem>
                      <SelectItem value="2">2 - Modéré</SelectItem>
                      <SelectItem value="3">3 - Élevé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description de l'ingrédient, ses effets, précautions..."
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

          {/* Ingredients List */}
          <Card className="shadow-medium border-border/50 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Liste des ingrédients ({ingredients.length})</CardTitle>
              <CardDescription>
                Tous les ingrédients enregistrés dans la base de données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Niveau de danger</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Aucun ingrédient enregistré
                        </TableCell>
                      </TableRow>
                    ) : (
                      ingredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell className="font-medium">{ingredient.name}</TableCell>
                          <TableCell>{ingredient.category || "-"}</TableCell>
                          <TableCell>
                            <Badge className={`${dangerLevelLabels[ingredient.danger_level || "0"].color} text-white`}>
                              {dangerLevelLabels[ingredient.danger_level || "0"].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(ingredient)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDeleteId(ingredient.id)}
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
              Êtes-vous sûr de vouloir supprimer cet ingrédient ? Cette action est irréversible.
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

export default AdminIngredients;
