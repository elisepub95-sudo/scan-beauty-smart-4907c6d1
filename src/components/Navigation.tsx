import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, Scan, Stethoscope, Sparkles, User, ShieldCheck, LogOut, Search } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    }
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

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/scan", icon: Scan, label: "Scanner" },
    { path: "/search", icon: Search, label: "Recherche" },
    { path: "/diagnostic", icon: Stethoscope, label: "Diagnostic" },
    { path: "/routine", icon: Sparkles, label: "Routine" },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-strong z-50 md:top-0 md:bottom-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent gradient-primary">
              Scan & Know
            </span>
          </div>

          <div className="flex items-center justify-around md:justify-center w-full md:w-auto gap-1 md:gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`flex flex-col md:flex-row items-center gap-1 h-auto py-2 px-3 transition-smooth ${
                    isActive(item.path) ? "gradient-primary shadow-soft" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs md:text-sm">{item.label}</span>
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  className={`flex flex-col md:flex-row items-center gap-1 h-auto py-2 px-3 transition-smooth ${
                    isActive("/admin") ? "gradient-primary shadow-soft" : ""
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs md:text-sm">Admin</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="hidden md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 transition-smooth hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
