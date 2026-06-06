
CREATE TABLE IF NOT EXISTS public.nps_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostico_id uuid NULL REFERENCES public.diagnosticos(id) ON DELETE CASCADE,
  score integer NOT NULL,
  comentario text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nps_responses TO authenticated;
GRANT SELECT, INSERT ON public.nps_responses TO anon;
GRANT ALL ON public.nps_responses TO service_role;

ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_nps" ON public.nps_responses;
DROP POLICY IF EXISTS "allow_select_nps" ON public.nps_responses;
DROP POLICY IF EXISTS "anon_insert_nps_valid_diagnostico" ON public.nps_responses;
DROP POLICY IF EXISTS "service_role_select_nps" ON public.nps_responses;

CREATE POLICY "anon_insert_nps_valid_diagnostico"
  ON public.nps_responses
  FOR INSERT
  TO anon
  WITH CHECK (
    diagnostico_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.diagnosticos WHERE id = diagnostico_id)
  );

CREATE POLICY "service_role_select_nps"
  ON public.nps_responses
  FOR SELECT
  TO service_role
  USING (true);
