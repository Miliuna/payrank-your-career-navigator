import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

type ShellProps = {
  step: number;
  totalSteps?: number;
  progress?: number; // 0..100, overrides step ratio
  children: React.ReactNode;
};

export function DiagnosticoShell({ step, totalSteps = 8, progress, children }: ShellProps) {
  const pct = progress ?? Math.round((step / totalSteps) * 100);
  return (
    <div className="min-h-screen bg-tinta text-hueso">
      <header className="fixed top-0 inset-x-0 z-50 bg-tinta">
        <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-hueso">
            <Logo />
          </Link>
          <span className="font-ui text-[10px] text-hueso/60">
            Paso {step} de {totalSteps}
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

export function StepFade({ children }: { children: React.ReactNode; k?: string | number }) {
  return (
    <div className="transition-opacity duration-200 ease-in-out" style={{ opacity: 1 }}>
      {children}
    </div>
  );
}

