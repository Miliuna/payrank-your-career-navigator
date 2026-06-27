DROP POLICY IF EXISTS "Allow anonymous insert" ON public.modo_e_waitlist;

CREATE POLICY "Allow anonymous insert with validation" ON public.modo_e_waitlist
  FOR INSERT TO anon
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND codigo_descuento IS NULL
    AND codigo_usado = false
    AND (tarifa_monto IS NULL OR tarifa_monto > 0)
  );