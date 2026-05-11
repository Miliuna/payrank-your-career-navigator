import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-tinta text-hueso">
      <div className="mx-auto max-w-6xl px-5 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="text-hueso">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6 md:gap-10 font-ui text-[10px] md:text-[11px] text-hueso/80">
          <Link to="/metodologia" className="hover:text-hueso transition-colors">Metodología</Link>
          <a href="/#precios" className="hover:text-hueso transition-colors">Planes</a>
          <span className="flex items-center gap-2 text-hueso/60">
            <span className="text-hueso underline underline-offset-4">ES</span>
            <span aria-hidden>·</span>
            <button className="hover:text-hueso transition-colors" type="button">EN</button>
          </span>
        </nav>
      </div>
    </header>
  );
}
