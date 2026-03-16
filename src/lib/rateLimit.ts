/**
 * Rate Limiter in-memory para Server Actions y API Routes
 * Sin dependencias externas — funciona perfecto para desarrollo local y small/medium prod
 *
 * Uso:
 *   const result = await rateLimit('createPost', userId, { max: 5, window: 60 })
 *   if (!result.ok) throw new Error(result.message)
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Almacén global en memoria (se reinicia con cada deploy/restart del servidor)
const store = new Map<string, RateLimitEntry>()

// Limpieza automática cada 5 minutos para evitar fugas de memoria
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const entries = Array.from(store.entries())
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i]
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  /** Máximo de llamadas permitidas en la ventana */
  max: number
  /** Ventana de tiempo en segundos */
  window: number
}

interface RateLimitResult {
  ok: boolean
  remaining: number
  resetIn: number // segundos hasta el reset
  message: string
}

export async function rateLimit(
  action: string,
  userId: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `${action}:${userId}`
  const now = Date.now()
  const windowMs = options.window * 1000

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // Primera llamada o ventana expirada
    store.set(key, { count: 1, resetAt: now + windowMs })
    return {
      ok: true,
      remaining: options.max - 1,
      resetIn: options.window,
      message: 'OK',
    }
  }

  if (entry.count >= options.max) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000)
    return {
      ok: false,
      remaining: 0,
      resetIn,
      message: `Demasiadas solicitudes. Espera ${resetIn} segundo${resetIn !== 1 ? 's' : ''}.`,
    }
  }

  entry.count++
  return {
    ok: true,
    remaining: options.max - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
    message: 'OK',
  }
}

// ── Límites predefinidos por acción ─────────────────────────────────────────

export const RATE_LIMITS = {
  createPost:    { max: 10,  window: 60  },  // 10 posts por minuto
  addComment:    { max: 20,  window: 60  },  // 20 comentarios por minuto
  toggleLike:    { max: 60,  window: 60  },  // 60 likes por minuto
  register:      { max: 3,   window: 300 },  // 3 intentos cada 5 minutos
  login:         { max: 5,   window: 60  },  // 5 intentos por minuto
  sendMessage:   { max: 30,  window: 60  },  // 30 mensajes por minuto
  createJob:     { max: 5,   window: 3600 }, // 5 ofertas por hora
  createProject: { max: 5,   window: 3600 }, // 5 proyectos por hora
  createGroup:   { max: 3,   window: 3600 }, // 3 grupos por hora
} as const
