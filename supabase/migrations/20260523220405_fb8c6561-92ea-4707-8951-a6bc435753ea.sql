ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS referido_por text;
CREATE INDEX IF NOT EXISTS idx_diagnosticos_referido_por ON public.diagnosticos(referido_por);