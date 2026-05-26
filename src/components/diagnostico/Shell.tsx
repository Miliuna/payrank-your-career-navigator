import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { useLang } from "@/lib/lang";

type ShellProps = {
  step: number;
  totalSteps?: number;
  progress?: number; // 0..100, overrides step ratio
  children: React.ReactNode;
};

export function DiagnosticoShell({ step, totalSteps = 8, progress, children }: ShellProps) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const pct = progress ?? Math.round((step / totalSteps) * 100);
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <header className="fixed top-0 inset-x-0 z-50 bg-tinta">
        <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-hueso">
            <Logo />
          </Link>
          <span className="font-ui text-[10px] text-hueso/60">
            {isEN ? `Step ${step} of ${totalSteps}` : `Paso ${step} de ${totalSteps}`}
          </span>
        </div>
        <div className="h-[2px] bg-hueso/10 w-full">
          <div
            className="h-full bg-hueso transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>
      <main className="pt-24 pb-24 px-5 md:px-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}

export function StepFade({ children, k }: { children: React.ReactNode; k: number | string }) {
  const [visible, setVisible] = React.useState(false);
  // useLayoutEffect corre antes del paint: oculta el contenido nuevo antes de que el browser lo vea,
  // eliminando el parpadeo que causaba el useEffect (que corre después del paint).
  React.useLayoutEffect(() => {
    setVisible(false);
  }, [k]);
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [k]);
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 150ms ease" }}>
      {children}
    </div>
  );
}

