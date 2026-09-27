# Arreglo de raíz: el servidor del preview arranca sin las variables de conexión

## Qué encontré (causa)

- La conexión con permisos de escritura usa dos valores: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Lovable Cloud los entrega al proceso del servidor del preview en el momento en que ese proceso arranca. No vienen de un archivo del proyecto: el archivo de configuración del proyecto tiene la dirección y la clave pública, pero nunca la clave de servicio.
- Cuando sincronizás desde GitHub, el preview se reconstruye y el servidor se reinicia solo. Por ejemplo, hoy el servidor arrancó de nuevo a las 19:14:30, justo con la última sincronización. Si ese arranque ocurre antes de que la plataforma haya entregado las variables, el proceso sigue corriendo sin ellas todo el tiempo. Un proceso no puede recibir variables nuevas después de arrancar, así que esperar dentro del mismo proceso no serviría.
- El código actual recién se da cuenta cuando llega el primer pedido que necesita la base de datos. Por eso falla a mitad del formulario en lugar de fallar al arrancar.
- Estado ahora mismo: el proceso que arrancó a las 19:14:30 sí tiene las dos variables.

## Arreglo propuesto (un solo archivo, no toca claves ni configuración)

Archivo: `src/server.ts`, el punto de entrada del servidor que atiende cada pedido. No toca Stripe, no toca los secretos, no toca los archivos de conexión generados automáticamente ni el archivo de configuración del proyecto.

Qué hace:
1. En el primer pedido, revisa si el proceso tiene `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Solo revisa si existen; nunca lee ni muestra sus valores.
2. **Solo en desarrollo** (el servidor del preview), si falta alguna:
   - escribe en el registro un aviso claro: `[startup-guard] faltan variables ... reiniciando proceso`;
   - responde ese pedido con "503, reintentá en unos segundos" en lugar de un error de base de datos;
   - termina el proceso con código de error. El supervisor del preview lo relanza solo, y el proceso nuevo toma las variables que ya están disponibles.
3. Para evitar un bucle, solo se permite un reinicio automático por minuto. El supervisor además tiene su propio límite de 5 reinicios por minuto.
4. En la versión publicada (payrank.co) no hace nada: allá las variables se entregan en cada pedido y este problema no existe.

Resultado: si vuelve a arrancar "ciego", se corrige solo en unos segundos sin que nadie lo reinicie a mano. En el peor caso, ves un único aviso de "reintentá" en vez de que falle el diagnóstico.

Límite honesto: esto no puede hacer que la plataforma entregue las variables antes. Lo que hace es detectar el arranque "ciego" y reiniciar solo. Si la plataforma no las entregara nunca, el aviso en el registro lo va a dejar claro de inmediato.

## Después de aplicar: prueba completa con el navegador automatizado

Todo en el servidor de desarrollo, en modo test de Stripe, y verificando que el link empiece con `cs_test_`. Si aparece `cs_live_`, freno sin pagar.
1. Formulario de diagnóstico completo (datos de prueba, marcados como dato de prueba) → captura.
2. Paywall → captura.
3. Checkout de Stripe test con la tarjeta 4242 4242 4242 4242 → captura de la página de Stripe y del pago confirmado.
4. Confirmación del pago: registro del webhook y `pago_confirmado = true` en la base.
5. Pantalla de procesando → informe generado → captura, más la fila en la base con el informe.

Nota: el aviso de pago de Stripe (webhook) de test tiene que llegar al preview. Si no está configurado para esa dirección, lo reporto y confirmo el pago consultando a Stripe directamente, sin cambiar nada de su configuración.

## Detalle técnico

- `src/server.ts`: una función `ensureServerEnv()` que se llama en `fetch` antes de `getServerEntry()`. Se activa solo con `process.env.NODE_ENV !== "production"`. Guarda la marca de tiempo del último reinicio en `/tmp/.startup-guard` para limitarlo a uno por minuto. Al salir usa `process.exit(1)` con un `setTimeout` corto, para que primero se envíe la respuesta 503.
- Se registra la regla en `AGENTS.md`.
