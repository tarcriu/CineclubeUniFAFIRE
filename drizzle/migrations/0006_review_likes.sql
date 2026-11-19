CREATE TABLE public.review_likes (
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  device_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, device_id)
);
GRANT ALL ON public.review_likes TO service_role;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.review_like_counts()
RETURNS TABLE(review_id uuid, likes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT review_id, count(*) FROM public.review_likes GROUP BY review_id
$$;

CREATE OR REPLACE FUNCTION public.my_liked_reviews(_device_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT review_id FROM public.review_likes WHERE device_id = _device_id
$$;

CREATE OR REPLACE FUNCTION public.toggle_review_like(_review_id uuid, _device_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.review_likes WHERE review_id = _review_id AND device_id = _device_id;
  IF FOUND THEN RETURN false; END IF;
  INSERT INTO public.review_likes(review_id, device_id) VALUES (_review_id, _device_id);
  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION public.review_like_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_liked_reviews(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_review_like(uuid, uuid) TO anon, authenticated;