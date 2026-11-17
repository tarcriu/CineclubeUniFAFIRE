CREATE TABLE public.site_theme (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  color text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_theme TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_theme TO authenticated;
GRANT ALL ON public.site_theme TO service_role;
ALTER TABLE public.site_theme ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read theme" ON public.site_theme FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members insert theme" ON public.site_theme FOR INSERT TO authenticated WITH CHECK (public.is_cineclube_member() AND (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'));
CREATE POLICY "Members update theme" ON public.site_theme FOR UPDATE TO authenticated USING (public.is_cineclube_member()) WITH CHECK (public.is_cineclube_member() AND (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'));