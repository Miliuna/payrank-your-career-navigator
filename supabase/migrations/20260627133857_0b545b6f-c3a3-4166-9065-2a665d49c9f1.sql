ALTER TABLE public.modo_e_waitlist
  ADD COLUMN IF NOT EXISTS categoria_servicio text,
  ADD COLUMN IF NOT EXISTS pais text,
  ADD COLUMN IF NOT EXISTS tarifa_monto numeric,
  ADD COLUMN IF NOT EXISTS tarifa_moneda text,
  ADD COLUMN IF NOT EXISTS tarifa_periodo text,
  ADD COLUMN IF NOT EXISTS region_pricing text;