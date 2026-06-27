import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLang } from "@/lib/lang";
import { useRegion } from "@/lib/pricing";
import { registrarWaitlistModoE } from "@/lib/diagnostico/diagnostico.functions";

export const Route = createFileRoute("/modo-f")({
  head: () => ({
    meta: [
      { title: "Próximamente — PayRank" },
      { name: "description", content: "PayRank para quienes trabajan de forma independiente. Sumate a la lista de espera." },
    ],
  }),
  component: ModoEWaitlistPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-ui text-[10px] tracking-wider text-piedra mb-2">{label}</p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-transparent border border-niebla px-4 py-3 font-body text-sm text-tinta placeholder:text-piedra/70 focus:outline-none focus:border-tinta";

function ModoEWaitlistPage() {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const { region } = useRegion();
  const registrar = useServerFn(registrarWaitlistModoE);

  const [email, setEmail] = React.useState("");
  const [categoria, setCategoria] = React.useState("");
  const [pais, setPais] = React.useState("");
  const [tarifaMonto, setTarifaMonto] = React.useState("");
  const [tarifaMoneda, setTarifaMoneda] = React.useState("");
  const [tarifaPeriodo, setTarifaPeriodo] = React.useState<"mensual" | "por_hora">("mensual");
  const [estado, setEstado] = React.useState<"idle" | "enviando" | "ok" | "error">("idle");

  const submit = async () => {
    if (!email.trim() || estado === "enviando") return;
    setEstado("enviando");
    try {
      const monto = tarifaMonto.trim() ? Number(tarifaMonto.trim()) : undefined;
      await registrar({
        data: {
          email: email.trim(),
          categoriaServicio: categoria.trim() || undefined,
          pais: pais.trim() || undefined,
          tarifaMonto: monto && isFinite(monto) && monto > 0 ? monto : undefined,
          tarifaMoneda: tarifaMoneda.trim() || undefined,
          tarifaPeriodo: tarifaMonto.trim() ? tarifaPeriodo : undefined,
          regionPricing: region ?? undefined,
          isEN,
        },
      });
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  };

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <SiteHeader />

      <section className="pt-32 md:pt-44 pb-20 md:pb-28 px-5 md:px-10">
        <div className="mx-auto max-w-2xl">
          <p className="font-ui text-[10px] text-piedra mb-6 tracking-wider">
            {isEN ? "COMING SOON" : "PRÓXIMAMENTE"}
          </p>

          <h1 className="font-display text-3xl md:text-4xl mb-7 leading-tight">
            {isEN
              ? "That silence after you say your rate — was it because you asked for too much, or because you accepted too little without knowing it?"
              : "Ese silencio después de decir tu tarifa — ¿fue porque pediste de más, o porque aceptaste de menos sin saberlo?"}
          </h1>

          <p className="font-body text-base text-piedra leading-relaxed mb-12">
            {isEN
              ? "Whether or not you have a method to set your rate, what's missing is something to compare it against: a real market reference — not a colleague's opinion or a WhatsApp group."
              : "Tengas o no un método para definir tu tarifa, lo que falta es algo con qué compararla: una referencia real de mercado, no la opinión de un colega o un grupo de WhatsApp."}
          </p>

          <div className="bg-card border border-niebla p-7 md:p-9">
            {estado === "ok" ? (
              <p className="font-body text-base text-tinta leading-relaxed">
                {isEN
                  ? "Done — you're on the list, and your data is already part of the first real rate landscape for this segment. We just sent your single-use 20% launch discount code by email — we'll write again as soon as it's ready to use."
                  : "Listo, ya estás en la lista — y tu dato ya pasó a formar parte del primer panorama real de tarifas para este segmento. Te acabamos de mandar por mail tu código de un solo uso con 20% de descuento de lanzamiento — te escribimos de nuevo en cuanto esté listo para usar."}
              </p>
            ) : (
              <>
                <p className="font-body text-base text-tinta leading-relaxed mb-2">
                  {isEN
                    ? "Join the waitlist — you'll be among the first to use it when it's ready."
                    : "Sumate a esta lista de espera — vas a ser de los primeros en usarlo cuando esté disponible."}
                </p>
                <p className="font-body text-sm text-piedra leading-relaxed mb-7">
                  {isEN
                    ? "Everyone on this list gets a single-use 20% launch discount code, sent by email right now."
                    : "Todos los que se anoten reciben un código de un solo uso con 20% de descuento de lanzamiento, enviado por mail al instante."}
                </p>

                <div className="space-y-4">
                  <Field label={isEN ? "EMAIL" : "MAIL"}>
                    <input
                      type="email"
                      placeholder="tu@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={isEN ? "SERVICE CATEGORY (OPTIONAL)" : "CATEGORÍA DE SERVICIO (OPCIONAL)"}>
                    <input
                      type="text"
                      placeholder={isEN ? "E.g: Design, consulting, development..." : "Ej: Diseño, consultoría, desarrollo..."}
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label={isEN ? "COUNTRY (OPTIONAL)" : "PAÍS (OPCIONAL)"}>
                      <input
                        type="text"
                        placeholder={isEN ? "Your country" : "Tu país"}
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label={isEN ? "CURRENT RATE (OPTIONAL)" : "TARIFA ACTUAL (OPCIONAL)"}>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={tarifaMonto}
                          onChange={(e) => setTarifaMonto(e.target.value)}
                          className={inputClass + " flex-1"}
                        />
                        <input
                          type="text"
                          placeholder="USD"
                          value={tarifaMoneda}
                          onChange={(e) => setTarifaMoneda(e.target.value)}
                          className={inputClass + " w-20"}
                        />
                      </div>
                    </Field>
                  </div>

                  {tarifaMonto.trim() && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTarifaPeriodo("mensual")}
                        className={`px-3 py-1.5 font-ui text-[10px] border transition-colors ${
                          tarifaPeriodo === "mensual" ? "bg-tinta text-hueso border-tinta" : "border-niebla text-piedra hover:border-tinta"
                        }`}
                      >
                        {isEN ? "Monthly" : "Mensual"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTarifaPeriodo("por_hora")}
                        className={`px-3 py-1.5 font-ui text-[10px] border transition-colors ${
                          tarifaPeriodo === "por_hora" ? "bg-tinta text-hueso border-tinta" : "border-niebla text-piedra hover:border-tinta"
                        }`}
                      >
                        {isEN ? "Per hour" : "Por hora"}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={submit}
                    disabled={!email.trim() || estado === "enviando"}
                    className="w-full inline-flex items-center justify-center gap-2 bg-tinta text-hueso px-6 py-3 font-ui text-[11px] hover:bg-tinta/90 transition-colors disabled:opacity-40"
                  >
                    {estado === "enviando"
                      ? (isEN ? "Sending..." : "Enviando...")
                      : (isEN ? "Join the waitlist →" : "Quiero entrar a la lista →")}
                  </button>

                  {estado === "error" && (
                    <p className="font-body text-sm text-red-700">
                      {isEN ? "Something went wrong — try again." : "Algo falló — probá de nuevo."}
                    </p>
                  )}

                  <p className="font-body text-[11px] text-piedra/80 leading-relaxed">
                    {isEN
                      ? "Your rate is used exclusively for this calculation and stored anonymized."
                      : "Tu tarifa se usa exclusivamente para este cálculo y se almacena de forma anonimizada."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
