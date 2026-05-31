-- 1. Create codigos_acceso table
CREATE TABLE public.codigos_acceso (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo text NOT NULL UNIQUE,
  tipo text NOT NULL DEFAULT 'beta',
  usos_maximos integer NOT NULL DEFAULT 1,
  usos_actuales integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

-- 2. Grants (admin-only via service_role; no anon/authenticated access — validation runs server-side)
GRANT ALL ON public.codigos_acceso TO service_role;

-- 3. Enable RLS
ALTER TABLE public.codigos_acceso ENABLE ROW LEVEL SECURITY;

-- (No policies for anon/authenticated — table is only read/written via supabaseAdmin server functions.)

-- 4. Add codigo_acceso_usado column to diagnosticos
ALTER TABLE public.diagnosticos
ADD COLUMN IF NOT EXISTS codigo_acceso_usado text;

-- 5. Seed 5 initial beta codes
INSERT INTO public.codigos_acceso (codigo, tipo, usos_maximos) VALUES
  ('PAYRANK-BETA-001', 'beta', 10),
  ('PAYRANK-BETA-002', 'beta', 10),
  ('PAYRANK-BETA-003', 'beta', 10),
  ('PAYRANK-BETA-004', 'beta', 10),
  ('PAYRANK-BETA-005', 'beta', 10);
