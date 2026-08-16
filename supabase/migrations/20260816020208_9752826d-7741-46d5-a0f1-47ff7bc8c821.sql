CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id TEXT NOT NULL,
  device_id UUID NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5),
  name TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (movie_id, device_id)
);

GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
ON public.reviews FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can submit a review"
ON public.reviews FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(coalesce(name, '')) <= 60
  AND char_length(coalesce(comment, '')) <= 1000
);