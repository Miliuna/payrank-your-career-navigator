import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ref/$codigo")({
  beforeLoad: ({ params }) => {
    const codigo = (params.codigo ?? "").trim();
    // Save synchronously on the client BEFORE the redirect, so the code
    // survives even if the homepage's URL is later cleaned up.
    if (typeof window !== "undefined" && codigo) {
      try {
        window.localStorage.setItem("payrank.codigoReferido", codigo);
      } catch {
        // localStorage may be unavailable (private mode, etc.) — the ?ref
        // search param below is the fallback.
      }
    }
    throw redirect({ to: "/", search: codigo ? { ref: codigo } : {} });
  },
});
