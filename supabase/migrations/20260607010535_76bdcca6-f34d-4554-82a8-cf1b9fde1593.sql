GRANT INSERT ON public.nps_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nps_responses TO authenticated;
GRANT ALL ON public.nps_responses TO service_role;