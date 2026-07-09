import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { reenviarCodigoAcceso } from "@/lib/diagnostico/diagnostico.functions";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/recuperar-codigo")({
  head: () => ({ meta: [{ title: "Recuperar código — PayRank" }] }),
  component: RecuperarCodigoPage,
});

function RecuperarCodigoPage() {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const enviar = useServerFn(reenviarCodigoAcceso);

  const [email, setEmail] = React.useState("");
  const [estado, setEstado] = React.useState<"idle" | "busy" | "enviado">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEstado("busy");
    try {
      await enviar({ data: { email: email.trim() } });
    } catch {
      // No mostramos error técnico — el mensaje final es siempre el mismo.
    } finally {
      setEstado("enviado");
    }
  };

  return (
    <div className="min-h-screen bg-hueso text-tinta">
      <header className="fixed top-0 inset-x-0 z-50 bg-hueso">
        <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-tinta text-xl">PayRank</Link>
        </div>
      </header>

      <main className="pt-28 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-[480px]">
          <div className="bg-tinta text-hueso p-8 md:p-10">
            <h1 className="font-display text-2xl md:text-3xl text-hueso mb-3 leading-tight">
              {isEN ? "Recover your code" : "Recuperar tu código"}
            </h1>
            <p className="font-body text-sm text-hueso/70 mb-8">
              {isEN
                ? "If your email has active PayRank codes, we'll send them to you."
                : "Si tu mail tiene códigos PayRank activos, te los reenviamos."}
            </p>

            {estado !== "enviado" ? (
              <form onSubmit={onSubmit}>
                <label className="font-ui text-[10px] text-hueso/55 block mb-2">
                  {isEN ? "YOUR EMAIL" : "TU MAIL"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isEN ? "you@email.com" : "vos@mail.com"}
                    className="flex-1 bg-hueso/5 border border-hueso/20 px-3 py-2 font-body text-sm text-hueso placeholder:text-hueso/40 focus:outline-none focus:border-hueso/60"
                  />
                  <button
                    type="submit"
                    disabled={estado === "busy"}
                    className="px-4 py-2 border border-hueso/30 font-ui text-[10px] text-hueso hover:bg-hueso hover:text-tinta transition-colors disabled:opacity-50"
                  >
                    {estado === "busy" ? "…" : (isEN ? "SEND" : "ENVIAR")}
                  </button>
                </div>
              </form>
            ) : (
              <p className="font-body text-sm" style={{ color: "#2E4A6E" }}>
                {isEN
                  ? "If that email has active codes, check your inbox in a few minutes."
                  : "Si ese mail tiene códigos activos, revisá tu casilla en unos minutos."}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}