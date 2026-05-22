ALTER TABLE public.diagnosticos
ADD COLUMN IF NOT EXISTS tipo_cambio_utilizado jsonb;