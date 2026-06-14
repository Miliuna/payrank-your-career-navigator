insert into public.codigos_acceso (codigo, tipo, usos_maximos, usos_actuales, activo)
values
 ('PAYRANK-BETA-006','beta',10,0,true),
 ('PAYRANK-BETA-007','beta',10,0,true),
 ('PAYRANK-BETA-008','beta',10,0,true),
 ('PAYRANK-BETA-009','beta',10,0,true),
 ('PAYRANK-BETA-010','beta',10,0,true)
on conflict (codigo) do update set usos_maximos = 10, usos_actuales = 0, activo = true;