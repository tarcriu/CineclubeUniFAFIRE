DROP POLICY "Cineclube members can delete reviews" ON public.reviews;
DROP FUNCTION IF EXISTS public.is_cineclube_member();

CREATE POLICY "Cineclube members can delete reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'cineclube@unifafire.edu.br');