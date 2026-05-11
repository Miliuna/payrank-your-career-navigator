export function SiteFooter() {
  return (
    <footer className="border-t border-niebla/60 bg-hueso">
      <div className="mx-auto max-w-6xl px-5 md:px-10 py-10 flex flex-col md:flex-row gap-3 md:gap-8 items-start md:items-center justify-between font-ui text-[10px] text-piedra">
        <span>© 2026 PayRank</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-tinta">Política de Privacidad</a>
          <a href="#" className="hover:text-tinta">Términos y Condiciones</a>
        </div>
      </div>
    </footer>
  );
}
