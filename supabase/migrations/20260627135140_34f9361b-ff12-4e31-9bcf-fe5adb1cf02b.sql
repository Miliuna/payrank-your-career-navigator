ALTER TABLE public.modo_e_waitlist
  ADD COLUMN IF NOT EXISTS codigo_descuento text,
  ADD COLUMN IF NOT EXISTS codigo_usado boolean NOT NULL DEFAULT false;