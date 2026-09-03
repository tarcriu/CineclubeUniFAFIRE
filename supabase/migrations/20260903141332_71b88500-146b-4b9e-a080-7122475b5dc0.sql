CREATE TABLE public.movies (
  id text PRIMARY KEY,
  title text NOT NULL,
  director text NOT NULL,
  year integer,
  synopsis text,
  image_url text,
  session_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.movies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movies TO authenticated;
GRANT ALL ON public.movies TO service_role;

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read movies" ON public.movies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cineclube members can insert movies" ON public.movies FOR INSERT TO authenticated WITH CHECK (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br');
CREATE POLICY "Cineclube members can update movies" ON public.movies FOR UPDATE TO authenticated USING (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br') WITH CHECK (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br');
CREATE POLICY "Cineclube members can delete movies" ON public.movies FOR DELETE TO authenticated USING (lower(COALESCE(auth.jwt() ->> 'email', '')) = 'cineclube@unifafire.edu.br');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.movies (id, title, director, year, synopsis, image_url, session_date) VALUES
('whiplash', 'Whiplash - Em Busca da Perfeição', 'Damien Chazelle', 2014, 'Andrew Neiman é um jovem baterista obcecado em se tornar um dos maiores músicos de sua geração. Ao ingressar no prestigioso Conservatório Shaffer, em Nova York, ele passa a ser orientado pelo temido maestro Terence Fletcher — um homem capaz de qualquer crueldade em nome da excelência.', '/__l5e/assets-v1/5de3ed7f-6b32-46fb-975d-1f543b980515/whiplash.jpg', '2026-08-26'),
('homem-com-h', 'Homem com H', 'Esmir Filho', 2025, NULL, NULL, '2026-05-27'),
('ira-anjo', 'A Ira de um Anjo', 'Larry Peerce', 1992, NULL, NULL, '2026-05-13'),
('lorax', 'Lorax: Em Busca da Trúfula Perdida', 'Chris Renaud', 2012, NULL, NULL, '2026-04-22'),
('nao-se-preocupe', 'Não Se Preocupe, Querida', 'Olivia Wilde', 2022, NULL, NULL, '2026-03-23');