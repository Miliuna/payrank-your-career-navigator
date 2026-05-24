import * as React from "react";

type Lang = "ES" | "EN";

const LangContext = React.createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "ES", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("ES");

  // Read stored preference after mount only — keeps ES as the server-side
  // and first-paint default, avoids SSR hydration mismatches.
  React.useEffect(() => {
    const stored = localStorage.getItem("payrank_lang");
    if (stored === "EN") setLangState("EN");
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("payrank_lang", l);
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
