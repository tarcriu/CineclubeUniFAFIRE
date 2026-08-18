CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT (id, movie_id, rating, name, comment, created_at) ON public.reviews TO anon, authenticated;
ALTER VIEW public.reviews_public SET (security_invoker = on);