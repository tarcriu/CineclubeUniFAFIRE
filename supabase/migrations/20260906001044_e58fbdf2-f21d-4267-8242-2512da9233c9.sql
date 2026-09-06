ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE OR REPLACE FUNCTION public.purge_old_deleted_movies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.reviews r
  WHERE r.movie_id IN (
    SELECT m.id FROM public.movies m
    WHERE m.deleted_at IS NOT NULL AND m.deleted_at < now() - interval '3 months'
  );
  DELETE FROM public.movies m
  WHERE m.deleted_at IS NOT NULL AND m.deleted_at < now() - interval '3 months';
END;
$$;

GRANT EXECUTE ON FUNCTION public.purge_old_deleted_movies() TO authenticated, service_role;