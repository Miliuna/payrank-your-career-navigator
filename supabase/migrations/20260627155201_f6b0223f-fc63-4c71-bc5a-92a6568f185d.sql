REVOKE SELECT, UPDATE, DELETE ON public.modo_e_waitlist FROM authenticated;
REVOKE SELECT ON public.modo_e_waitlist FROM anon;
CREATE POLICY "No anon select" ON public.modo_e_waitlist FOR SELECT TO anon USING (false);
CREATE POLICY "No authenticated select" ON public.modo_e_waitlist FOR SELECT TO authenticated USING (false);