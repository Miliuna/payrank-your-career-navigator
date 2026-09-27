// Determina si un pedido debe usar las credenciales LIVE de Stripe, según el
// dominio real desde el que llega (no según cómo se compiló la app).
// Fail-safe: SOLO estos dominios usan LIVE. Cualquier otro dominio, o un host
// que no se pueda determinar, cae a TEST — nunca al revés.
const LIVE_HOSTS = new Set(["payrank.co", "www.payrank.co"]);

export function isLiveHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0].trim().toLowerCase();
  return LIVE_HOSTS.has(hostname);
}
