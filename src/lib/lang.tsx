import * as React from "react";

type Lang = "ES" | "EN";

const LangContext = React.createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "ES", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("payrank_lang");
      if (stored === "EN" || stored === "ES") return stored as Lang;
    }
    return "ES";
  });

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("payrank_lang", l);
    }
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return React.useContext(LangContext);
}
