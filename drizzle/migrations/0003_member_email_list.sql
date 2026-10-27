CREATE OR REPLACE FUNCTION public.is_cineclube_member()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN ('cineclube@unifafire.edu.br', 'dionisio202527808@grad.unifafire.edu.br')
$$;
REVOKE ALL ON FUNCTION public.is_cineclube_member() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_cineclube_member() TO authenticated, service_role;

ALTER POLICY "Cineclube members can delete movies" ON public.movies USING (public.is_cineclube_member());
ALTER POLICY "Cineclube members can insert movies" ON public.movies WITH CHECK (public.is_cineclube_member());
ALTER POLICY "Cineclube members can update movies" ON public.movies USING (public.is_cineclube_member()) WITH CHECK (public.is_cineclube_member());
ALTER POLICY "Members can read all movies" ON public.movies USING (public.is_cineclube_member());
ALTER POLICY "Cineclube members can delete reviews" ON public.reviews USING (public.is_cineclube_member());
ALTER POLICY "Members can read qr" ON public.site_qr USING (public.is_cineclube_member());
ALTER POLICY "Members delete qr" ON public.site_qr USING (public.is_cineclube_member());
ALTER POLICY "Members insert qr" ON public.site_qr WITH CHECK (public.is_cineclube_member());
ALTER POLICY "Members update qr" ON public.site_qr USING (public.is_cineclube_member()) WITH CHECK (public.is_cineclube_member());

CREATE OR REPLACE FUNCTION public.purge_old_deleted_movies()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_cineclube_member() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  DELETE FROM public.reviews r
  WHERE r.movie_id IN (
    SELECT m.id FROM public.movies m
    WHERE m.deleted_at IS NOT NULL AND m.deleted_at < now() - interval '3 months'
  );
  DELETE FROM public.movies m
  WHERE m.deleted_at IS NOT NULL AND m.deleted_at < now() - interval '3 months';
END;
$$;