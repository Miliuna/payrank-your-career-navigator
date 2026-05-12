## Alcance

Reemplazar el flujo actual del formulario por la versión definitiva: 8 pantallas, 19 preguntas, validación de inferencia con IA, paywall y guardado en backend.

## Bloqueos antes de empezar

1. **Stripe**: las claves siguen pendientes. Recomendación → activar **Lovable Payments con Stripe** (no requiere que vos tengas cuenta de Stripe ni pegues claves). Avisame y lo activo. Mientras tanto, construyo el Paso 6 con un placeholder funcional ("Pagar — pendiente de configuración") y se enchufa en el momento.
2. **Modelo Anthropic**: pediste `claude-sonnet-4-6`, ese identificador no existe. Voy a usar `claude-sonnet-4-5` (último Sonnet 4.x). Si querés otro, decimelo.
3. **WhatsApp**: solo se guarda en Supabase para envío posterior. No se envía nada en este sprint.
4. **Plan elegido (GO/PLUS/PRO)**: hoy no hay selector de plan en `/`. Voy a leerlo de query string `?plan=go|plus|pro` y default GO. Si querés selector visible, lo agregamos aparte.

## Arquitectura

```text
/modo                     (existente — entrada)
/diagnostico/upload       Paso 1 — upload de documentos
/diagnostico/preguntas    Paso 2 — chat conversacional (19 preguntas)
/diagnostico/inferencia   Paso 3 — validar inferencia de valuación
/diagnostico/perfil       Paso 4 — validación final del perfil
/diagnostico/legal        Paso 5 — consentimientos
/diagnostico/pago         Paso 6 — paywall + Stripe
/diagnostico/procesando   Paso 7 — loading + llamada a Anthropic
/diagnostico/[id]         Resultado (link único compartible)
```

Estado del flujo en `localStorage` + zustand hasta el Paso 6. Después del pago, todo se persiste en Supabase y se navega por id de diagnóstico.

## Backend (Supabase)

Tabla `diagnosticos` con todos los campos del brief + RLS:
- Lectura pública por `id` (link compartible) o por `user_id` si está autenticado
- Insert solo desde server function autenticada vía service role tras pago confirmado

Tabla `documentos_upload` temporal (solo metadata + texto extraído, no archivos).

Server functions:
- `extractDocument` → parsea PDF/Word con `pdf-parse` o similar y devuelve texto plano
- `inferProfile` → llama a Anthropic para pre-completar y para inferir las 5 dimensiones de valuación
- `generateDiagnostico` → llamada final a Anthropic, guarda en `diagnosticos`, dispara mail con Resend
- `createCheckoutSession` → Stripe (cuando esté activo)
- `/api/public/stripe-webhook` → confirma pago y dispara generación

## UI

- Diseño consistente con el resto del sitio: fondo Tinta `#0C0C0C`, texto Hueso `#F5F2ED`, Bodoni Moda para títulos, Josefin Sans para UI
- Mobile-first, validado en 390px
- Una pregunta por pantalla con animación de entrada (framer-motion)
- Barra de progreso superior
- Cards con hover/active states consistentes con `/modo`
- Todos los "Otra/Otro" abren input de texto libre automáticamente

## Entrega por etapas

Por el tamaño, propongo entregar en 3 PRs dentro de esta misma conversación:

**PR1 — Estructura + Pasos 1, 2, 3, 4** (UI completa, sin backend)
**PR2 — Pasos 5, 6, 7 + Supabase + Anthropic + Resend** (todo el backend, paywall con placeholder de Stripe)
**PR3 — Stripe Payments + webhook + página de resultado compartible**

Empiezo por PR1 apenas confirmes.

## Detalles técnicos

- Validación con zod en cliente y servidor
- `claude-sonnet-4-5` vía Lovable AI Gateway (sin pedirte API key extra)
- Resend vía connector ya configurado con tu `RESEND_API_KEY`
- Documentos: parseados en server, NO se almacenan archivos. Solo el texto extraído queda en memoria de la sesión y los datos estructurados terminan en `diagnosticos`
- Anti-doble-submit en el paywall y idempotencia en la generación

## Confirmá para arrancar

1. ¿Activo **Lovable Payments con Stripe** ahora? (recomendado)
2. ¿OK con `claude-sonnet-4-5` en lugar de `claude-sonnet-4-6`?
3. ¿OK leer el plan de query string por ahora, o querés selector visible primero?
4. ¿Arranco por PR1?