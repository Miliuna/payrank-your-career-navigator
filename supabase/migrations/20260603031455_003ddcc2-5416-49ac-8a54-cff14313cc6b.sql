-- Tighten INSERT policies on nps_responses and followup_responses to require
-- a real diagnostico_id, preventing pollution with null/arbitrary UUIDs.

DROP POLICY IF EXISTS "Public insert nps_responses" ON public.nps_responses;
CREATE POLICY "Public insert nps_responses"
ON public.nps_responses
FOR INSERT
TO public
WITH CHECK (
  score >= 0
  AND score <= 10
  AND diagnostico_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.diagnosticos d WHERE d.id = diagnostico_id)
);

DROP POLICY IF EXISTS "Public insert followup_responses" ON public.followup_responses;
CREATE POLICY "Public insert followup_responses"
ON public.followup_responses
FOR INSERT
TO public
WITH CHECK (
  dia = ANY (ARRAY[30, 60, 90])
  AND (utilidad_score IS NULL OR (utilidad_score >= 1 AND utilidad_score <= 5))
  AND diagnostico_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.diagnosticos d WHERE d.id = diagnostico_id)
);