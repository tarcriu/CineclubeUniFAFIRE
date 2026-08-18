DROP POLICY "Anyone can read reviews" ON public.reviews;
REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT INSERT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;

CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = off) AS
SELECT id, movie_id, rating, name, comment, created_at
FROM public.reviews;

GRANT SELECT ON public.reviews_public TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_reviewed(_movie_id text, _device_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.reviews
    WHERE movie_id = _movie_id AND device_id = _device_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_reviewed(text, uuid) TO anon, authenticated;