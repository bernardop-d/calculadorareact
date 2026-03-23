/**
 * Rate limiter em memória (single-instance).
 * Para multi-instância em produção, substituir por Redis (Upstash).
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * @param key     Identificador único (ex: "login:IP" ou "login:email")
 * @param limit   Máximo de tentativas
 * @param windowMs Janela de tempo em ms (padrão: 15 min)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
