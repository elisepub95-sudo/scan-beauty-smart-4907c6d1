-- Ajouter les colonnes manquantes pour les ingrédients
ALTER TABLE public.global_ingredients 
ADD COLUMN IF NOT EXISTS suitable_for text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS avoid_for text[] DEFAULT NULL;

-- Ajouter un index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_global_ingredients_name ON public.global_ingredients USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_global_products_name ON public.global_products USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_global_products_barcode ON public.global_products(barcode);

-- Ajouter une fonction pour calculer le risk_level d'un produit basé sur ses ingrédients
CREATE OR REPLACE FUNCTION calculate_product_risk_level(product_ingredients text[])
RETURNS danger_level
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  high_count integer;
  medium_count integer;
BEGIN
  -- Compter les ingrédients dangereux
  SELECT 
    COUNT(*) FILTER (WHERE danger_level = '2') as high,
    COUNT(*) FILTER (WHERE danger_level = '1') as medium
  INTO high_count, medium_count
  FROM public.global_ingredients
  WHERE name = ANY(product_ingredients);
  
  -- Si au moins 1 ingrédient très dangereux -> high
  IF high_count > 0 THEN
    RETURN '2'::danger_level;
  -- Si au moins 2 ingrédients moyennement dangereux -> high
  ELSIF medium_count >= 2 THEN
    RETURN '2'::danger_level;
  -- Si au moins 1 ingrédient moyennement dangereux -> medium
  ELSIF medium_count > 0 THEN
    RETURN '1'::danger_level;
  -- Sinon -> safe
  ELSE
    RETURN '0'::danger_level;
  END IF;
END;
$$;