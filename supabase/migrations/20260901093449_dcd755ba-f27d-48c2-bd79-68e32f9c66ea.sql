CREATE OR REPLACE FUNCTION public.is_cineclube_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce((auth.jwt() ->> 'email'), '')) = 'cineclube@unifafire.edu.br'
$$;

GRANT DELETE ON public.reviews TO authenticated;

CREATE POLICY "Cineclube members can delete reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (public.is_cineclube_member());