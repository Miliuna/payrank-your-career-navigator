# Roadmap

- [x] Clave live de Stripe guardada (STRIPE_LIVE_API_KEY) y código apuntado a ella en producción
- [x] Cupón live de referidos guardado (STRIPE_LIVE_COUPON_ID = 4zOyfgyM) y usado en producción
- [x] STRIPE_WEBHOOK_SECRET actualizado con el signing secret del webhook live
- [x] Publicar a payrank.co
- [x] Guardia de arranque en src/server.ts (dev-only): reinicia si faltan variables del backend
- [x] Prueba end-to-end en modo test: formulario → paywall → checkout 4242 → webhook → informe (frenar si cs_live_)
