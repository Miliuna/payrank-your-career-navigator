ALTER TABLE public.diagnosticos
ADD COLUMN IF NOT EXISTS datos_extraidos_documento jsonb;