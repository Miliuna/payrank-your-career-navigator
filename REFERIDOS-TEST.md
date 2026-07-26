# Verificación del sistema de referidos (Stripe test mode)

Runbook para validar las 3 promesas del referral fix end-to-end, en modo test.
No requiere tocar producción. NADA de esto se publica sin tu OK.

> **Puerto:** `npm run dev` (vite) levanta en **http://localhost:8080** en este proyecto
> (lo fuerza `@lovable.dev/vite-tanstack-config`). Local no usa `strictPort`, así que si el
> 8080 está ocupado vite salta al siguiente libre — **usá el puerto que imprime `vite dev`**
> al arrancar. Los ejemplos de abajo asumen 8080.

## 0. Qué se cambió (resumen)
- **15% off automático**: `createCheckoutSession` aplica el cupón `STRIPE_REFERIDO_COUPON_ID`
  si el diagnóstico vino de un link de referido válido.
- **Input manual de referido eliminado** del paywall (era cosmético). Copy corregida en
  landing/planes: el descuento es automático con el link.
- **3er referido gratis**: el webhook `checkout.session.completed` cuenta pagos reales
  (tabla `pagos`, status `paid`, dedupe por `diagnostico_id`). Al llegar a 3, genera un
  `codigos_acceso` tipo `referido_gratis` (1 uso) y manda mail al referente con botón a
  `/canjear/<codigo>`.
- **Canje 1-clic**: `/canjear/<codigo>` guarda el código y entra al funnel; el paywall lo
  autoaplica y bypasea el pago.

## 1. Setup local
En `.env` (claves de TEST):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # lo da `stripe listen` (ver abajo)
RESEND_API_KEY=re_...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_REFERIDO_COUPON_ID=...          # coupon_id EXISTENTE en tu cuenta (percent_off:15, duration:once)
PUBLIC_APP_URL=http://localhost:8080   # ← IMPORTANTE en test: el link del mail se arma con esto.
                                       #   Sin esto, el botón del mail apunta a https://payrank.co.
                                       #   Ajustá el puerto al que realmente imprima `vite dev`.
```
Levantar:
```
npm run dev          # vite dev → http://localhost:8080
stripe listen --forward-to localhost:8080/api/public/stripe-webhook
```
Copiá el `whsec_...` que imprime `stripe listen` a `STRIPE_WEBHOOK_SECRET` y reiniciá el dev server.

## 2. Generar un link de referido real
- Completá 1 PayRank (o tomá un `link_unico` existente de la tabla `diagnosticos`).
- El **refCode** = `link_unico` sin guiones, primeros 8 chars (mismo criterio que
  `ReportFooterActions.tsx`). Ej: `link_unico = a1b2c3d4-....` → refCode = `a1b2c3d4`.
- Link a compartir: `http://localhost:8080/ref/<refCode>`
- ✅ **Validación del supuesto del plan**: confirmá que `link_unico` es un UUID y que el
  match `ilike '<refCode>-%'` devuelve ese diagnóstico. Si tu `link_unico` NO es un UUID,
  avisá — el matcheo de referente asume esa forma.

## 3. Tres pagos de test (promesa "15% off")
Por cada uno de los 3 referidos (usá ventana incógnito para no arrastrar estado):
1. Abrí `http://localhost:8080/ref/<refCode>`.
2. Completá el funnel hasta el paywall y pagá con `4242 4242 4242 4242` (fecha futura, cualquier CVC).
3. ✅ **Confirmar (a)**: en el checkout de Stripe aparece **"-15%"** nativo antes de pagar.

## 4. Al 3er pago (promesa "el próximo es gratis")
- ✅ **Confirmar (b)**: el **referente** (dueño del link) recibe el mail
  "Tu próximo PayRank es gratis" con un código `PAYRANK-REF-...` y el botón
  **"Canjear mi PayRank gratis"** apuntando a `/canjear/<codigo>`.
- En Supabase, verificá que se creó la fila en `codigos_acceso`:
  `tipo='referido_gratis'`, `usos_maximos=1`, `usos_actuales=0`, `activo=true`, `email=<referente>`.

## 5. Canje del código gratis (bypass de pago)
1. Abrí `http://localhost:8080/canjear/<codigo>` (o tocá el botón del mail).
2. Redirige a `/modo`; completá un PayRank hasta el paywall.
3. ✅ **Confirmar (c)**: el código se **autoaplica** en el paywall y redirige a `/procesando`
   **sin cobrar**.
4. En Supabase, sobre ese diagnóstico:
   - `pago_confirmado = true`
   - `tipo_usuario = 'beta_gratuito'`  ← mapeado (para no violar el CHECK)
   - `codigo_acceso_usado = <codigo>`
   - en `codigos_acceso`: `usos_actuales = 1`

## 6. Idempotencia
- Reenviá el mismo evento (`stripe events resend <evt_id>`) o hacé un 4º pago referido.
- ✅ **Confirmar**: NO se genera un segundo código para el mismo referente
  (ya existe uno `tipo='referido_gratis'` con ese email → se saltea).

## 7. Notas / límites conocidos
- El conteo se dispara con un **pago de Stripe**. Si el 3er referido "completa" su PayRank
  por una vía sin Stripe (beta token / código), el conteo llega a 3 pero el premio recién
  se evalúa en el próximo `checkout.session.completed`. En la práctica los referidos pagan.
- El conteo usa la tabla `pagos` (status `paid`), NO `diagnosticos.pago_confirmado`
  (hardcodeado en `true` hoy). Cuando desactiven ese "TEMPORAL", el conteo sigue igual.
- **FUERA DE ALCANCE (flagueado)**: el mismo CHECK de `tipo_usuario` rompería el canje de
  códigos `plus_credito`/`press`/`promo` (escriben `acceso_*`). Este fix NO lo agrava; se
  resuelve aparte (expandir CHECK vía migración, o extender el mapeo).

## 8. Deploy (cuando des el OK)
- Setear en Cloudflare: `STRIPE_REFERIDO_COUPON_ID` (coupon real) y, opcional,
  `PUBLIC_APP_URL=https://payrank.co` (si no, cae al fallback hardcodeado a payrank.co).
- Verificar que el endpoint del webhook en Stripe (modo live) apunte al dominio correcto.
