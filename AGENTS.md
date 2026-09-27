
- Dev-only startup guard in src/server.ts exits the dev server when SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are missing so the supervisor respawns it — the preview sometimes spawns before env injection.
