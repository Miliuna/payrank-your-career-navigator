-- Restringir tipo_usuario a los tres valores válidos
ALTER TABLE public.diagnosticos
  DROP CONSTRAINT IF EXISTS diagnosticos_tipo_usuario_check;

ALTER TABLE public.diagnosticos
  ADD CONSTRAINT diagnosticos_tipo_usuario_check
  CHECK (tipo_usuario IN ('beta_gratuito', 'pago', 'seed'));

-- Tabla de tokens beta
CREATE TABLE IF NOT EXISTS public.beta_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  nota text,
  usado_count integer NOT NULL DEFAULT 0,
  max_usos integer NOT NULL DEFAULT 1,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_tokens ENABLE ROW LEVEL SECURITY;

-- Lectura pública (la validación real se hace en server fns con service role)
CREATE POLICY "Public read beta_tokens"
ON public.beta_tokens FOR SELECT
USING (true);

CREATE TRIGGER update_beta_tokens_updated_at
BEFORE UPDATE ON public.beta_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();