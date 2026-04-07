// Rate limiter en mémoire pour les routes API publiques.
// Utilise une Map côté serveur pour compter les requêtes par clé (IP).
// En environnement serverless (Vercel), chaque instance a sa propre Map,
// ce qui rend le rate limiting « best effort ». Pour une protection
// plus stricte en production, envisager un store partagé (Redis, Upstash).

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  // Nombre max de requêtes autorisées dans la fenêtre
  maxRequests: number;
  // Durée de la fenêtre en millisecondes
  windowMs: number;
}

// Store global partagé entre les appels dans la même instance serveur
const rateLimitStore = new Map<string, RateLimitEntry>();

// Nettoyage périodique des entrées expirées pour éviter les fuites mémoire.
// Intervalle volontairement long (5 min) car le nombre de clés reste faible.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Vérifie si une clé (typiquement l'IP) a dépassé la limite de requêtes.
 * Renvoie { allowed: true } si OK, ou { allowed: false, retryAfterMs } si bloqué.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Première requête ou fenêtre expirée → réinitialiser le compteur
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true };
  }

  // Encore dans la fenêtre → incrémenter
  entry.count += 1;

  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      retryAfterMs: entry.resetTime - now,
    };
  }

  return { allowed: true };
}

/**
 * Extrait l'IP du client depuis les headers de la requête.
 * x-forwarded-for est défini par les reverse proxies (Vercel, Cloudflare…).
 * Fallback sur "unknown" si non disponible.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules,
    // la première est celle du client réel
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
