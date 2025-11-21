-- Créer la table d'historique des scans
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.global_products(id) ON DELETE CASCADE,
  barcode TEXT,
  product_name TEXT NOT NULL,
  product_brand TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX idx_scan_history_scanned_at ON public.scan_history(scanned_at DESC);
CREATE INDEX idx_scan_history_product_id ON public.scan_history(product_id);

-- Activer RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre historique
CREATE POLICY "Users can view their own scan history"
ON public.scan_history
FOR SELECT
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent ajouter à leur historique
CREATE POLICY "Users can insert their own scan history"
ON public.scan_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leur historique
CREATE POLICY "Users can delete their own scan history"
ON public.scan_history
FOR DELETE
USING (auth.uid() = user_id);