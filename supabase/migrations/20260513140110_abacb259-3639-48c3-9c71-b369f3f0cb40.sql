CREATE TABLE public.diagnosticos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  tipo_usuario TEXT NOT NULL DEFAULT 'pago',
  es_dato_seed BOOLEAN NOT NULL DEFAULT false,

  modo TEXT,
  pais_rol TEXT,
  industria TEXT,
  tipo_empresa TEXT,
  nivel TEXT,
  alcance TEXT,
  funciones TEXT[],
  equipo TEXT,
  interaccion_clevel TEXT,
  idiomas JSONB,
  anos_experiencia_total TEXT,
  anos_experiencia_industria TEXT,
  anos_puesto_actual TEXT,
  formacion TEXT[],
  certificaciones TEXT[],
  herramientas_ia JSONB,
  frecuencia_ia TEXT,
  uso_ia TEXT[],
  situacion_laboral TEXT,
  salario_actual NUMERIC,
  moneda_actual TEXT,
  salario_tipo TEXT,
  beneficios TEXT[],
  puesto_descripcion TEXT,
  linkedin_url TEXT,
  genero TEXT,
  mail TEXT,
  whatsapp TEXT,

  inferencia_valuacion JSONB,
  inferencia_validada BOOLEAN NOT NULL DEFAULT false,
  ajustes_inferencia JSONB,

  resultado_json JSONB,

  pago_confirmado BOOLEAN NOT NULL DEFAULT false,
  stripe_payment_id TEXT,
  plan_elegido TEXT,
  monto_pagado_usd NUMERIC,

  nivel_confianza TEXT,
  enps_score INTEGER,
  enps_feedback TEXT,

  link_unico TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  pdf_enviado BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_diagnosticos_link_unico ON public.diagnosticos(link_unico);
CREATE INDEX idx_diagnosticos_created_at ON public.diagnosticos(created_at DESC);

ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

-- Lectura pública por id/link (es un link compartible)
CREATE POLICY "Public read diagnosticos"
  ON public.diagnosticos
  FOR SELECT
  USING (true);

-- Sin políticas de INSERT/UPDATE/DELETE: solo el service role (server) puede modificar

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_diagnosticos_updated_at
  BEFORE UPDATE ON public.diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();