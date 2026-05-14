-- Grants explícitos para tablas existentes (cambio de permisos Supabase 2026-05-30)

-- diagnosticos
grant select on public.diagnosticos to anon;
grant select, insert, update, delete on public.diagnosticos to authenticated;
grant select, insert, update, delete on public.diagnosticos to service_role;
alter table public.diagnosticos enable row level security;

-- beta_tokens
grant select on public.beta_tokens to anon;
grant select, insert, update, delete on public.beta_tokens to authenticated;
grant select, insert, update, delete on public.beta_tokens to service_role;
alter table public.beta_tokens enable row level security;