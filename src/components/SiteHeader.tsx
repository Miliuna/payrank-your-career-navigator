import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useLang } from "@/lib/lang";

export function SiteHeader() {
  const { lang, setLang } = useLang();
  const isEN = lang === "EN";

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-tinta text-hueso">
      <div className="mx-auto max-w-6xl px-5 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="text-hueso">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6 md:gap-10 font-ui text-[10px] md:text-[11px] text-hueso/80">
          <Link to="/metodologia" className="hover:text-hueso transition-colors">
            {isEN ? "METHODOLOGY" : "METODOLOGÍA"}
          </Link>
          <Link to="/planes" className="hover:text-hueso transition-colors">
            {isEN ? "PLANS" : "PLANES"}
          </Link>
          <span className="flex items-center gap-2 text-hueso/60">
            <button
              type="button"
              onClick={() => setLang("ES")}
              className={`transition-colors ${!isEN ? "text-hueso underline underline-offset-4" : "hover:text-hueso"}`}
            >
              ES
            </button>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={() => setLang("EN")}
              className={`transition-colors ${isEN ? "text-hueso underline underline-offset-4" : "hover:text-hueso"}`}
            >
              EN
            </button>
          </span>
        </nav>
      </div>
    </header>
  );
}
