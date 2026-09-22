# Roadmap

- [ ] Restaurar clave de Stripe de producción: usuario rota la clave en Stripe y la carga vía update_secret (STRIPE_SECRET_KEY) — bloqueado: esperando que el usuario genere la nueva clave sk_live_
- [ ] Confirmar que STRIPE_REFERIDO_COUPON_ID existe en modo live de Stripe (el cupón 0a04tnDV se creó en test) — si no, crearlo y actualizar el secreto
- [ ] Publicar a payrank.co una vez restaurada la clave live
