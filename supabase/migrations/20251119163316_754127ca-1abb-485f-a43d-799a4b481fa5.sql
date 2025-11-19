-- Create global_products table
CREATE TABLE public.global_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  type TEXT,
  category TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.global_products ENABLE ROW LEVEL SECURITY;

-- Create policies for global products
CREATE POLICY "Anyone can view products" 
ON public.global_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert products" 
ON public.global_products 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update products" 
ON public.global_products 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete products" 
ON public.global_products 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_global_products_updated_at
BEFORE UPDATE ON public.global_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();