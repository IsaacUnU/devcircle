// ─── Sistema de moderación de contenido ──────────────────────────────────────
// Usa puntuación (scoring) en vez de keyword-ban.
// Palabras técnicas de developers (crypto, bitcoin, nft…) son LEGÍTIMAS.
// Solo se marca spam si se combinan múltiples señales de mal uso.

// ── Categorías de señales ─────────────────────────────────────────────────────

// Señales de SPAM/PHISHING claras (peso alto)
const HIGH_SPAM_SIGNALS = [
  // Esquemas de dinero fácil
  'ganate dinero fácil', 'gana dinero fácil', 'hazte rico', 'pasivos en minutos',
  'inversión garantizada', 'dobla tu dinero', 'ganancias del 1000%',
  // Phishing / credenciales
  'ingresa tus datos', 'verifica tu cuenta ahora', 'tu cuenta será suspendida',
  'haz clic aquí para reclamar', 'reclama tu premio',
  // Spam de seguidores
  'compra seguidores', 'buy followers', 'cheap followers', 'free followers',
  'boost your followers', 'comprar me gusta',
  // Contenido adulto
  'xxx', 'onlyfans.com', 'porn', 'nude pics', 'sexting',
  // Lotería / scams
  'ganaste un iphone', 'ganaste $', 'has ganado un premio', 'lotería gratis',
  'envianos tu número', 'envía tu número de tarjeta',
]

// Señales de spam contextuales (peso medio — 1 sola no basta)
const MEDIUM_SPAM_SIGNALS = [
  'airdrop gratis', 'free airdrop', 'giveaway oficial',
  'invierte ahora', 'oportunidad limitada', 'últimas plazas',
  'régimen de afiliados', 'programa de referidos ilimitado',
  'WhatsApp +', 'telegram @', 'únete a mi grupo de señales',
  'señales gratis', 'trading señales',
]

// Palabras técnicas legítimas para developers — NO son spam
// (solo se usan para bajar el score si aparecen en contexto técnico)
const TECH_CONTEXT_WORDS = [
  'blockchain', 'smart contract', 'solidity', 'web3', 'dapp', 'defi',
  'ethereum', 'bitcoin', 'crypto', 'nft', 'token', 'wallet', 'binance',
  'coinbase', 'metamask', 'hardhat', 'truffle', 'ethers.js', 'wagmi',
  'nextjs', 'react', 'typescript', 'api', 'sdk', 'node', 'rust', 'go',
  'python', 'docker', 'kubernetes', 'github', 'open source',
  'hash', 'merkle', 'consensus', 'proof of work', 'proof of stake',
  'layer 2', 'layer2', 'zk-proof', 'rollup', 'arbitrum', 'optimism',
]

// Dominios de phishing conocidos
const PHISHING_PATTERNS = [
  /auth[\-_]?verify\./i,
  /login[\-_]?secure\./i,
  /support[\-_]?ticket\d+\./i,
  /account[\-_]?update\./i,
  /free[\-_]?nitro\./i,
  /gift[\-_]?nitro\./i,
  /steam[\-_]?promo\./i,
  /claim[\-_]?reward\./i,
  /verify[\-_]?wallet\./i,
]

// ── Función principal ─────────────────────────────────────────────────────────
export function isSpam(text: string): boolean {
  if (!text || text.trim().length === 0) return false

  const lower = text.toLowerCase()
  let score = 0

  // 1. Señales de alta gravedad — basta 1 para spam
  for (const signal of HIGH_SPAM_SIGNALS) {
    if (lower.includes(signal)) return true
  }

  // 2. Patrones de phishing en URLs
  for (const pattern of PHISHING_PATTERNS) {
    if (pattern.test(lower)) return true
  }

  // 3. Señales medias — acumulan puntos
  for (const signal of MEDIUM_SPAM_SIGNALS) {
    if (lower.includes(signal)) score += 2
  }

  // 4. Indicadores de spam genéricos (peso 1)
  if (/\b(gratis|free|gana|earn|win)\b.*\b(click|clic|enlace|link|aquí|here)\b/i.test(lower)) score += 2
  if (/\$\d{3,}/.test(text)) score += 1                     // "$500", "$1000"
  if ((text.match(/!{2,}/g) ?? []).length >= 2) score += 1  // "!!! urgente!!!"
  if ((text.match(/[A-Z]{4,}/g) ?? []).length >= 2) score += 1 // palabras en MAYÚSCULAS

  // 5. Bajar score si hay contexto técnico legítimo
  const techMatches = TECH_CONTEXT_WORDS.filter(w => lower.includes(w)).length
  if (techMatches >= 2) score = Math.max(0, score - 2)
  if (techMatches >= 4) score = Math.max(0, score - 2)

  // Se considera spam si score >= 4
  return score >= 4
}

// Exportaciones de compatibilidad
export function containsAdultContent(text: string): boolean {
  const lower = text.toLowerCase()
  return ['xxx', 'onlyfans.com', 'porn', 'nude pics'].some(w => lower.includes(w))
}

export function isPhishingUrl(url: string): boolean {
  return PHISHING_PATTERNS.some(p => p.test(url))
}

// ── Razón de spam (para logs / debug) ────────────────────────────────────────
export function getSpamReason(text: string): string | null {
  if (!isSpam(text)) return null
  const lower = text.toLowerCase()
  for (const s of HIGH_SPAM_SIGNALS) {
    if (lower.includes(s)) return `Señal de alto riesgo: "${s}"`
  }
  return 'Combinación de indicadores de spam'
}
