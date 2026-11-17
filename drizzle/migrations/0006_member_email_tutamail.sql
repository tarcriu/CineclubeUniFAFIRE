CREATE OR REPLACE FUNCTION public.is_cineclube_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN ('cineclube@unifafire.edu.br', 'dionisio202527808@grad.unifafire.edu.br', 'dionisio.ai@tutamail.com')
$$;

REVOKE ALL ON FUNCTION public.is_cineclube_member() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_cineclube_member() TO authenticated, service_role;