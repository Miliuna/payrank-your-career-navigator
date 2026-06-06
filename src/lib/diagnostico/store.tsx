import * as React from "react";
import type { DiagnosticoState, Modo, Plan } from "./types";

const STORAGE_KEY = "payrank.diagnostico";
const REFERIDO_KEY = "payrank.codigoReferido";

export function clearDiagnosticoStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(REFERIDO_KEY);
  } catch {
    /* ignore */
  }
}

const initialState: DiagnosticoState = {
  modo: "A",
  plan: "unico",
  documentos: {},
  respuestas: {},
  inferenciaValidada: false,
};

type Ctx = {
  state: DiagnosticoState;
  setState: React.Dispatch<React.SetStateAction<DiagnosticoState>>;
  reset: () => void;
};

const DiagnosticoCtx = React.createContext<Ctx | null>(null);

export function DiagnosticoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<DiagnosticoState>(initialState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const reset = React.useCallback(() => {
    setState(initialState);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <DiagnosticoCtx.Provider value={{ state, setState, reset }}>
      {children}
    </DiagnosticoCtx.Provider>
  );
}

export function useDiagnostico() {
  const ctx = React.useContext(DiagnosticoCtx);
  if (!ctx) throw new Error("useDiagnostico must be used within DiagnosticoProvider");
  return ctx;
}

export function setModo(setState: Ctx["setState"], modo: Modo) {
  setState((s) => ({ ...s, modo }));
}

export function setPlan(setState: Ctx["setState"], plan: Plan) {
  setState((s) => ({ ...s, plan }));
}
