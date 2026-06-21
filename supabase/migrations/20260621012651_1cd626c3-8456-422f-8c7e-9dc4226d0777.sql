ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS antiguedad_rol text;
ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS tipo_negociacion text;
ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS orientacion_carrera text;
ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS punto_partida_salto text;
ALTER TABLE public.diagnosticos ADD COLUMN IF NOT EXISTS oferta_verbal text;