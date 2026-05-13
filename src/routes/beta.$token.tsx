import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

const BETA_TOKEN_KEY = "payrank.betaToken";

export const Route = createFileRoute("/beta/$token")({
  head: () => ({ meta: [{ title: "Acceso beta — PayRank" }] }),
  component: BetaEntryPage,
});

function BetaEntryPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (typeof window !== "undefined" && token) {
      window.localStorage.setItem(BETA_TOKEN_KEY, token);
    }
    navigate({ to: "/modo" });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-tinta text-hueso flex items-center justify-center">
      <p className="font-body text-hueso/60">Activando acceso beta…</p>
    </div>
  );
}
