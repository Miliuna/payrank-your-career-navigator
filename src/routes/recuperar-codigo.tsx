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
  const [motivo, setMotivo] = React.useState<"enviado" | "sin_codigos" | "agotados" | "error">(
    "enviado",
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEstado("busy");
    try {
      const res = (await enviar({ data: { email: email.trim() } })) as
        | { motivo?: "enviado" | "sin_codigos" | "agotados" }
        | undefined;
      setMotivo(res?.motivo ?? "enviado");
    } catch {
      setMotivo("error");
    } finally {
      setEstado("enviado");
    }
  };

  const mensaje = isEN
    ? {
        enviado: "We sent your codes — check your inbox in a few minutes.",
        agotados:
          "That email has codes, but all of them are already used or expired, so there's nothing to resend.",
        sin_codigos: "We couldn't find any code for that email, so no email was sent.",
        error: "Something went wrong on our side. Please try again in a few minutes.",
      }[motivo]
    : {
        enviado: "Te reenviamos tus códigos — revisá tu casilla en unos minutos.",
        agotados:
          "Ese mail tiene códigos, pero todos están ya usados o vencidos, así que no hay nada para reenviar.",
        sin_codigos: "No encontramos ningún código para ese mail, así que no enviamos ningún mail.",
        error: "Hubo un problema de nuestro lado. Probá de nuevo en unos minutos.",
      }[motivo];

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
              <div>
                <p className="font-body text-sm" style={{ color: "#2E4A6E" }}>
                  {mensaje}
                </p>
                {motivo !== "enviado" && (
                  <button
                    type="button"
                    onClick={() => setEstado("idle")}
                    className="mt-4 px-4 py-2 border border-hueso/30 font-ui text-[10px] text-hueso hover:bg-hueso hover:text-tinta transition-colors"
                  >
                    {isEN ? "TRY ANOTHER EMAIL" : "PROBAR OTRO MAIL"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}