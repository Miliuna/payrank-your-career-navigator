create table public.nps_responses (
  id uuid primary key default gen_random_uuid(),
  diagnostico_id uuid references public.diagnosticos(id) on delete set null,
  score integer not null check (score between 0 and 10),
  feedback text,
  created_at timestamptz not null default now()
);

grant select on public.nps_responses to anon;
grant select, insert, update, delete on public.nps_responses to authenticated;
grant select, insert, update, delete on public.nps_responses to service_role;

alter table public.nps_responses enable row level security;

create policy "Public read nps_responses" on public.nps_responses for select using (true);
create policy "Public insert nps_responses" on public.nps_responses for insert with check (score between 0 and 10);