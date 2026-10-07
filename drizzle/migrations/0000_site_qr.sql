CREATE TABLE public.site_qr (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  link text,
  image_url text,
  visible boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_qr TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_qr TO authenticated;
GRANT ALL ON public.site_qr TO service_role;
ALTER TABLE public.site_qr ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read qr" ON public.site_qr FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members insert qr" ON public.site_qr FOR INSERT TO authenticated WITH CHECK (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br');
CREATE POLICY "Members update qr" ON public.site_qr FOR UPDATE TO authenticated USING (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br') WITH CHECK (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br');
CREATE POLICY "Members delete qr" ON public.site_qr FOR DELETE TO authenticated USING (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br');
INSERT INTO public.site_qr (id) VALUES (1);