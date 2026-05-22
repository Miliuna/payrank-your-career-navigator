-- Renombrar columna feedback -> comentario en nps_responses
ALTER TABLE public.nps_responses RENAME COLUMN feedback TO comentario;

-- Crear tabla followup_responses
CREATE TABLE public.followup_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    diagnostico_id UUID REFERENCES public.diagnosticos(id) ON DELETE CASCADE,
    dia INTEGER NOT NULL,
    tuvo_conversacion BOOLEAN,
    resultado TEXT,
    utilidad_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en followup_responses
ALTER TABLE public.followup_responses ENABLE ROW LEVEL SECURITY;

-- Grants según reglas del proyecto
GRANT SELECT ON public.followup_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.followup_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.followup_responses TO service_role;

-- Actualizar grants de nps_responses por consistencia
GRANT SELECT ON public.nps_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nps_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nps_responses TO service_role;

-- RLS policies para followup_responses
CREATE POLICY "Public read followup_responses"
ON public.followup_responses
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public insert followup_responses"
ON public.followup_responses
FOR INSERT
TO public
WITH CHECK (true);

-- Validación de score NPS (recrear para asegurar que sigue con nombre correcto)
DROP POLICY IF EXISTS "Public insert nps_responses" ON public.nps_responses;
CREATE POLICY "Public insert nps_responses"
ON public.nps_responses
FOR INSERT
TO public
WITH CHECK ((score >= 0) AND (score <= 10));

-- Validación opcional para utilidad_score en followup
CREATE POLICY "Validate utilidad_score followup"
ON public.followup_responses
FOR INSERT
TO public
WITH CHECK ((utilidad_score IS NULL) OR (utilidad_score >= 1 AND utilidad_score <= 5));

CREATE POLICY "Validate dia followup"
ON public.followup_responses
FOR INSERT
TO public
WITH CHECK (dia IN (30, 60, 90));
