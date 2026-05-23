import * as React from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/ref/$codigo")({
  component: RefPage,
});

function RefPage() {
  const { codigo } = useParams({ from: "/ref/$codigo" });
  const navigate = useNavigate();

  React.useEffect(() => {
    if (typeof window !== "undefined" && codigo) {
      window.localStorage.setItem("payrank.codigoReferido", codigo);
    }
    navigate({ to: "/" });
  }, [codigo, navigate]);

  return null;
}
