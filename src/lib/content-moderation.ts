export const SPAM_KEYWORDS = [
  'cripto', 'crypto', 'inversión segura', 'gana dinero', 'pasivos',
  'hazte rico', 'bitcoin', 'binance', 'wallet', 'nft', 'airdrop',
  'giveaway', 'loteria', 'ganaste', 'free followers', 'compra seguidores',
  'buy followers', 'cheap followers', 'porn', 'xxx', 'sex', 'nude', 'onlyfans'
]

export const PHISHING_DOMAINS = [
  'auth-verify', 'login-secure', 'support-ticket', 'account-update',
  'free-nitro', 'gift-nitro', 'steam-promo'
]

export function containsAdultContent(text: string): boolean {
  const lower = text.toLowerCase()
  return SPAM_KEYWORDS.some(kw => lower.includes(kw))
}

export function isPhishingUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return PHISHING_DOMAINS.some(domain => lower.includes(domain))
}

export function isSpam(text: string): boolean {
  return containsAdultContent(text) || isPhishingUrl(text)
}
