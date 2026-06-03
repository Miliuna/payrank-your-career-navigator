ALTER TABLE public.diagnosticos
  ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamp with time zone;