import { createFileRoute } from '@tanstack/react-router';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// Stripe SDK configurado para correr en Cloudflare Workers (fetch + Web Crypto).
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export const Route = createFileRoute('/api/public/stripe-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get('stripe-signature');
        if (!signature) {
          return new Response('Missing stripe-signature header', { status: 400 });
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error('STRIPE_WEBHOOK_SECRET no está configurado');
          return new Response('Server misconfigured', { status: 500 });
        }

        const rawBody = await request.text();
        const stripe = getStripe();

        let event: Stripe.Event;
        try {
          // constructEventAsync usa Web Crypto (necesario en Workers).
          event = await stripe.webhooks.constructEventAsync(
            rawBody,
            signature,
            webhookSecret,
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Invalid signature';
          console.error('Stripe signature verification failed:', msg);
          return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 });
        }

        if (event.type !== 'checkout.session.completed') {
          // Ack para otros eventos así Stripe no reintenta.
          return new Response(JSON.stringify({ received: true, ignored: event.type }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const session = event.data.object as Stripe.Checkout.Session;

        const email =
          session.customer_email ??
          session.customer_details?.email ??
          null;
        const clientReferenceId = session.client_reference_id ?? null;
        const priceId = session.line_items?.data?.[0]?.price?.id ?? null;
        // line_items normalmente no viene expandido; usar metadata como fallback.
        const planName =
          (session.metadata?.plan_name as string | undefined) ?? null;
        const amount =
          typeof session.amount_total === 'number'
            ? session.amount_total / 100
            : null;
        const currency = session.currency ?? null;
        const status = session.payment_status ?? 'unknown';
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        if (!email) {
          console.error('checkout.session.completed sin email', session.id);
          return new Response('Missing customer email', { status: 400 });
        }

        // 1) Insertar pago (idempotente vía unique en stripe_session_id).
        const { error: pagoError } = await supabaseAdmin
          .from('pagos')
          .upsert(
            {
              email,
              price_id: priceId,
              plan_name: planName,
              amount,
              currency,
              status,
              stripe_session_id: session.id,
              stripe_payment_intent_id: paymentIntentId,
              diagnostico_id: clientReferenceId,
            },
            { onConflict: 'stripe_session_id' },
          );

        if (pagoError) {
          console.error('Error guardando pago:', pagoError);
          return new Response(`DB error: ${pagoError.message}`, { status: 500 });
        }

        // 2) Marcar diagnóstico como pagado (matcheo por client_reference_id).
        if (clientReferenceId && status === 'paid') {
          const { error: diagError } = await supabaseAdmin
            .from('diagnosticos')
            .update({
              pago_confirmado: true,
              stripe_payment_id: paymentIntentId ?? session.id,
              plan_elegido: planName,
              monto_pagado_usd: currency === 'usd' ? amount : null,
            })
            .eq('id', clientReferenceId);

          if (diagError) {
            console.error('Error actualizando diagnóstico:', diagError);
            // No devolvemos 500: el pago ya quedó registrado, no queremos reintento infinito.
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
