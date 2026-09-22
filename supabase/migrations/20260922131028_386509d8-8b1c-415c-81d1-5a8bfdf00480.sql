-- Desactivar los códigos beta secuenciales ya agotados y reemplazar los
-- códigos predecibles (PAYRANK-BETA-001..010) por códigos aleatorios.
UPDATE public.codigos_acceso
SET activo = false
WHERE codigo ~ '^PAYRANK-BETA-[0-9]{3}$'
  AND usos_actuales >= usos_maximos;

UPDATE public.codigos_acceso
SET codigo = 'PAYRANK-BETA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
WHERE codigo ~ '^PAYRANK-BETA-[0-9]{3}$';