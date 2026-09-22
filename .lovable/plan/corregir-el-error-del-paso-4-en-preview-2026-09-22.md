# Corregir el error del paso 4 en preview

## Cambio
- Quitar el inicializador global de autenticación que intenta abrir una conexión desde el navegador aunque este flujo no requiere inicio de sesión.
- Mantener intacta la conexión privada del servidor usada para crear el diagnóstico.

## Verificación
- Reiniciar el preview y repetir la llamada del paso 4.
- Confirmar que ya no aparece el error de variables faltantes y que el diagnóstico se crea correctamente.

## Alcance
- Solo afecta al preview y al flujo actual; no se publica en producción.
