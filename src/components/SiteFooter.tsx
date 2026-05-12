export function SiteFooter() {
  return (
    <footer className="bg-tinta">
      <div className="mx-auto max-w-6xl px-5 md:px-10 py-10">
        <p className="font-ui text-[10px] text-piedra text-center md:text-left">
          © 2026 PayRank LLC · Todos los derechos reservados ·{" "}
          <a href="/politica-privacidad" className="hover:text-hueso transition-colors">Política de Privacidad</a>
          {" · "}
          <a href="/terminos-condiciones" className="hover:text-hueso transition-colors">Términos y Condiciones</a>
        </p>
      </div>
    </footer>
  );
}
