import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";

export function SiteFooter() {
  const { lang } = useLang();
  const isEN = lang === "EN";

  return (
    <footer style={{ backgroundColor: "#0C0C0C", color: "#C4BFB8" }}>
      <div className="mx-auto max-w-6xl px-5 md:px-10 py-10">
        <div
          className="flex flex-col md:flex-row gap-6 md:gap-10 md:justify-between"
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#C4BFB8",
            lineHeight: 1.7,
          }}
        >
          <div className="font-ui">
            © 2026 PayRank LLC ·{" "}
            <Link to="/politica-privacidad" className="hover:opacity-80 transition-opacity">
              {isEN ? "Privacy Policy" : "Política de Privacidad"}
            </Link>{" "}
            ·{" "}
            <Link to="/terminos-condiciones" className="hover:opacity-80 transition-opacity">
              {isEN ? "Terms" : "Términos"}
            </Link>
          </div>
          <div className="font-ui md:text-right">
            <div>PROFESSIONAL SALARY INTELLIGENCE</div>
            <div>
              payrank.co ·{" "}
              <a href="mailto:hello@payrank.co" className="hover:opacity-80 transition-opacity">
                hello@payrank.co
              </a>
            </div>
            <div>PayRank LLC · 30 N Gould St, Ste R · Sheridan, WY 82801</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
