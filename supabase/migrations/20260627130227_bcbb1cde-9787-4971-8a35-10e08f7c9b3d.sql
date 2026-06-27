CREATE TABLE IF NOT EXISTS public.modo_e_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.modo_e_waitlist TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modo_e_waitlist TO authenticated;
GRANT ALL ON public.modo_e_waitlist TO service_role;

ALTER TABLE public.modo_e_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON public.modo_e_waitlist FOR INSERT TO anon WITH CHECK (true);