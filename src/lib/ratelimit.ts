/**
 * Rate limiter en memoria para edge/middleware.
 * Best-effort: funciona dentro de una instancia serverless.
 * Para producción distribuida, reemplazar con Upstash Redis.
 */

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();

  // Limpiar entradas expiradas periódicamente
  if (store.size > 5000) {
    store.forEach((v, k) => {
      if (v.resetAt < now) store.delete(k);
    });
  }

  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // permitido
  }

  entry.count++;
  if (entry.count > max) return false; // bloqueado
  return true;
}
