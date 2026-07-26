import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/canjear/$codigo")({
  beforeLoad: ({ params }) => {
    const codigo = (params.codigo ?? "").trim();
    // Guardamos el código en el cliente ANTES del redirect, para que sobreviva
    // la limpieza de URL y el usuario entre al funnel con el canje pendiente.
    if (typeof window !== "undefined" && codigo) {
      try {
        window.localStorage.setItem("payrank.codigoAccesoGratis", codigo);
      } catch {
        // localStorage no disponible (modo privado, etc.) — sin fallback acá;
        // el usuario siempre puede pegar el código manualmente en el paywall.
      }
    }
    throw redirect({ to: "/modo" });
  },
});
