import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, Trash2, TrendingUp, Package, BarChart3, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ScanHistoryItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_brand: string | null;
  barcode: string | null;
  scanned_at: string;
}

interface Stats {
  totalScans: number;
  uniqueProducts: number;
  mostScannedProduct: string | null;
  scansThisWeek: number;
}

export default function ScanHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ScanHistoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalScans: 0,
    uniqueProducts: 0,
    mostScannedProduct: null,
    scansThisWeek: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, searchTerm, timeFilter]);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Non connecté",
          description: "Vous devez être connecté pour voir votre historique",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .order("scanned_at", { ascending: false });

      if (error) throw error;

      setHistory(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: ScanHistoryItem[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const uniqueProductIds = new Set(data.map(item => item.product_id).filter(Boolean));
    const scansThisWeek = data.filter(item => new Date(item.scanned_at) > weekAgo).length;

    // Trouver le produit le plus scanné
    const productCounts = data.reduce((acc, item) => {
      const key = item.product_name;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostScanned = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

    setStats({
      totalScans: data.length,
      uniqueProducts: uniqueProductIds.size,
      mostScannedProduct: mostScanned ? mostScanned[0] : null,
      scansThisWeek,
    });
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par période
    const now = new Date();
    switch (timeFilter) {
      case "today":
        filtered = filtered.filter(item => {
          const scanDate = new Date(item.scanned_at);
          return scanDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.scanned_at) > weekAgo);
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.scanned_at) > monthAgo);
        break;
    }

    setFilteredHistory(filtered);
  };

  const handleDeleteScan = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scan_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Supprimé",
        description: "L'entrée a été supprimée de votre historique",
      });

      fetchHistory();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entrée",
        variant: "destructive",
      });
    }
  };

  const handleProductClick = (productId: string | null) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-6xl mt-20">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl mt-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/scan")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au scanner
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Historique des Scans</h1>
          <p className="text-muted-foreground">
            Consultez tous vos produits scannés et vos statistiques d'utilisation
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de scans</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits uniques</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scansThisWeek}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plus scanné</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate">
                {stats.mostScannedProduct || "Aucun"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout l'historique</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois-ci</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste de l'historique */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des scans</CardTitle>
            <CardDescription>
              {filteredHistory.length} résultat{filteredHistory.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm || timeFilter !== "all"
                    ? "Aucun résultat trouvé"
                    : "Vous n'avez pas encore scanné de produit"}
                </p>
                <Button onClick={() => navigate("/scan")}>
                  Scanner un produit
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleProductClick(item.product_id)}
                    >
                      <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.product_name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {item.product_brand && (
                              <Badge variant="secondary" className="text-xs">
                                {item.product_brand}
                              </Badge>
                            )}
                            {item.barcode && (
                              <span className="text-xs">EAN: {item.barcode}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(item.scanned_at), "PPP 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteScan(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
