import * as React from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/lang";

export function LoadingOverlay({ show, message }: { show: boolean; message?: string }) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  if (!show) return null;
  const text = message ?? (isEN ? "Generating your PayRank..." : "Estamos generando tu PayRank...");
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-tinta/85 backdrop-blur-sm text-hueso"
    >
      <Loader2 className="w-10 h-10 animate-spin" aria-hidden />
      <p className="mt-6 font-body text-base md:text-lg text-hueso/90 text-center px-6">
        {text}
      </p>
    </div>
  );
}
