import * as React from "react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang";

export function QuestionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-3xl md:text-4xl leading-tight mb-3 text-hueso">
      {children}
    </h1>
  );
}

export function QuestionHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-sm md:text-base text-hueso/60 mb-8 leading-relaxed">
      {children}
    </p>
  );
}

type CardOptionProps = {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export function CardOption({ selected, onClick, children }: CardOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left font-body text-base md:text-lg p-5 md:p-6 border transition-all",
        selected
          ? "border-hueso bg-hueso text-tinta"
          : "border-hueso/20 text-hueso/85 hover:border-hueso/60 hover:bg-hueso/5"
      )}
    >
      {children}
    </button>
  );
}

export function ChipOption({ selected, onClick, children }: CardOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-ui text-[11px] px-4 py-2 border transition-all",
        selected
          ? "border-hueso bg-hueso text-tinta"
          : "border-hueso/30 text-hueso/80 hover:border-hueso"
      )}
    >
      {children}
    </button>
  );
}

type NavButtonsProps = {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export function NavButtons({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: NavButtonsProps) {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const label = nextLabel ?? (isEN ? "Continue" : "Continuar");
  return (
    <div className="mt-10 flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="font-ui text-[11px] text-hueso/60 hover:text-hueso transition-colors"
        >
          {isEN ? "← Back" : "← Volver"}
        </button>
      ) : (
        <span />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center gap-3 bg-hueso text-tinta px-6 py-3 font-ui text-[11px] hover:bg-hueso/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {label} <span aria-hidden>→</span>
        </button>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-transparent border-b border-hueso/30 focus:border-hueso outline-none font-body text-lg md:text-xl text-hueso placeholder:text-hueso/30 py-3 transition-colors",
        props.className
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full bg-hueso/5 border border-hueso/20 focus:border-hueso outline-none font-body text-base text-hueso placeholder:text-hueso/30 p-4 transition-colors min-h-32",
        props.className
      )}
    />
  );
}
