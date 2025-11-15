-- Add DELETE policy to diagnostics table
CREATE POLICY "Users can delete their own diagnostics"
ON public.diagnostics
FOR DELETE
USING (auth.uid() = user_id);

-- Add UPDATE policy to scanned_products table
CREATE POLICY "Users can update their own scanned products"
ON public.scanned_products
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);