create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  price_id text,
  plan_name text,
  amount numeric,
  currency text,
  status text not null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  diagnostico_id uuid references public.diagnosticos(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create index idx_pagos_diagnostico_id on public.pagos(diagnostico_id);
create index idx_pagos_email on public.pagos(email);

grant all on public.pagos to service_role;

alter table public.pagos enable row level security;
-- No public/authenticated policies: el webhook usa supabaseAdmin (service_role) que bypassea RLS.
