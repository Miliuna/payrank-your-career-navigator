-- Eliminar policies de insert genéricas y separadas
DROP POLICY IF EXISTS "Public insert followup_responses" ON public.followup_responses;
DROP POLICY IF EXISTS "Validate utilidad_score followup" ON public.followup_responses;
DROP POLICY IF EXISTS "Validate dia followup" ON public.followup_responses;

-- Crear una única policy de INSERT con validaciones combinadas
CREATE POLICY "Public insert followup_responses"
ON public.followup_responses
FOR INSERT
TO public
WITH CHECK (
  dia IN (30, 60, 90)
  AND (utilidad_score IS NULL OR (utilidad_score >= 1 AND utilidad_score <= 5))
);