import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLang } from "@/lib/lang";
import { registrarWaitlistModoE } from "@/lib/diagnostico/diagnostico.functions";

export const Route = createFileRoute("/modo-e")({
  head: () => ({
    meta: [
      { title: "Modo E — Próximamente — PayRank" },
      { name: "description", content: "PayRank para quienes trabajan de forma independiente. Sumate a la lista de espera." },
    ],
  }),
  component: ModoEWaitlistPage,
});

function ModoEWaitlistPage() {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const registrar = useServerFn(registrarWaitlistModoE);
  const [email, setEmail] = React.useState("");
  const [estado, setEstado] = React.useState<"idle" | "enviando" | "ok" | "error">("idle");

  const submit = async () => {
    if (!email.trim() || estado === "enviando") return;
    setEstado("enviando");
    try {
      await registrar({ data: { email: email.trim() } });
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
            {isEN ? "MODE E · COMING SOON" : "MODO E · PRÓXIMAMENTE"}
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
                  ? "Done — you're on the list, and your data is already part of the first real rate landscape for this segment. We'll write to you as soon as Mode E is ready to use."
                  : "Listo, ya estás en la lista — y tu dato ya pasó a formar parte del primer panorama real de tarifas para este segmento. Te escribimos en cuanto Modo E esté listo para usar."}
              </p>
            ) : (
              <>
                <p className="font-body text-base text-tinta leading-relaxed mb-7">
                  {isEN
                    ? "Join the Mode E waitlist — you'll be among the first to use it when it's ready, with a preferential launch rate."
                    : "Sumate a la lista de espera de Modo E — vas a ser de los primeros en usarlo cuando esté disponible, con un valor de lanzamiento preferencial."}
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="tu@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent border border-niebla px-4 py-3 font-body text-sm text-tinta placeholder:text-piedra focus:outline-none focus:border-tinta"
                  />
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!email.trim() || estado === "enviando"}
                    className="inline-flex items-center justify-center gap-2 bg-tinta text-hueso px-6 py-3 font-ui text-[11px] hover:bg-tinta/90 transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {estado === "enviando"
                      ? (isEN ? "Sending..." : "Enviando...")
                      : (isEN ? "Join the waitlist →" : "Quiero entrar a la lista →")}
                  </button>
                </div>
                {estado === "error" && (
                  <p className="font-body text-sm text-red-700 mt-3">
                    {isEN ? "Something went wrong — try again." : "Algo falló — probá de nuevo."}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
