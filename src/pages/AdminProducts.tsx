import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  ingredients: z.string().min(1, "Au moins un ingrédient est requis"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  type: string | null;
  category: string | null;
  ingredients: string[];
  created_at: string;
  updated_at: string;
}

const AdminProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      barcode: "",
      type: "",
      category: "",
      ingredients: "",
    },
  });

  useEffect(() => {
    checkAdminAccess();
    fetchProducts();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions d'administrateur.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("global_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits.",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        brand: product.brand || "",
        barcode: product.barcode || "",
        type: product.type || "",
        category: product.category || "",
        ingredients: product.ingredients.join(", "),
      });
    } else {
      setEditingProduct(null);
      form.reset({
        name: "",
        brand: "",
        barcode: "",
        type: "",
        category: "",
        ingredients: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (data: ProductFormData) => {
    const ingredientsArray = data.ingredients
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const productData = {
      name: data.name,
      brand: data.brand || null,
      barcode: data.barcode || null,
      type: data.type || null,
      category: data.category || null,
      ingredients: ingredientsArray,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("global_products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le produit.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Produit modifié avec succès.",
        });
        fetchProducts();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from("global_products")
        .insert([productData]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le produit.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Produit ajouté avec succès.",
        });
        fetchProducts();
        setDialogOpen(false);
      }
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    const { error } = await supabase
      .from("global_products")
      .delete()
      .eq("id", productToDelete.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès.",
      });
      fetchProducts();
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleCreateRoutine = (product: Product) => {
    // Navigate to routine creation with product data
    navigate("/admin/routines", { state: { productData: product } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Gestion des Produits
                </CardTitle>
                <CardDescription>
                  Ajoutez, modifiez ou supprimez des produits de la base globale
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun produit dans la base de données
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Marque</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Code-barres</TableHead>
                      <TableHead>Ingrédients</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand || "-"}</TableCell>
                        <TableCell>{product.type || "-"}</TableCell>
                        <TableCell>{product.category || "-"}</TableCell>
                        <TableCell>{product.barcode || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {product.ingredients.join(", ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateRoutine(product)}
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifiez les informations du produit"
                : "Ajoutez un nouveau produit à la base de données"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du produit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marque</FormLabel>
                    <FormControl>
                      <Input placeholder="Marque" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <FormControl>
                        <Input placeholder="Catégorie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code-barres</FormLabel>
                    <FormControl>
                      <Input placeholder="Code-barres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingrédients * (séparés par des virgules)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrédient 1, Ingrédient 2, Ingrédient 3..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingProduct ? "Modifier" : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit "{productToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
