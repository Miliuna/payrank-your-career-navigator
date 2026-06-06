ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_nps" ON public.nps_responses;

CREATE POLICY "allow_insert_nps" ON public.nps_responses
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_select_nps" ON public.nps_responses;

CREATE POLICY "allow_select_nps" ON public.nps_responses
  FOR SELECT USING (true);

GRANT INSERT ON public.nps_responses TO anon;
GRANT INSERT ON public.nps_responses TO authenticated;
GRANT SELECT ON public.nps_responses TO service_role;