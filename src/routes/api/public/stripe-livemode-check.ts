import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe-livemode-check")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) return Response.json({ error: "no key" }, { status: 500 });
        const r = await fetch("https://api.stripe.com/v1/balance", {
          headers: { Authorization: `Bearer ${key}` },
        });
        const j = await r.json();
        return Response.json({ livemode: j.livemode, prefix: key.slice(0, 8) });
      },
    },
  },
});
