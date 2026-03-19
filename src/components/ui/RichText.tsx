'use client'

import Link from 'next/link'
import { memo } from 'react'

/**
 * Parsea un texto y convierte @menciones y #hashtags en links clicables.
 * @menciones → /profile/:username
 * #hashtags  → /explorer?q=%23:tag
 */
export const RichText = memo(function RichText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const parts = text.split(/(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (/^@[a-zA-Z0-9_]+$/.test(part)) {
          const username = part.slice(1)
          return (
            <Link
              key={i}
              href={`/profile/${username}`}
              onClick={e => e.stopPropagation()}
              className="text-brand-400 hover:text-brand-300 hover:underline font-medium transition-colors"
            >
              {part}
            </Link>
          )
        }
        if (/^#[a-zA-Z0-9_]+$/.test(part)) {
          const tag = part.slice(1)
          return (
            <Link
              key={i}
              href={`/search?q=%23${encodeURIComponent(tag)}`}
              onClick={e => e.stopPropagation()}
              className="text-brand-400 hover:text-brand-300 hover:underline font-medium transition-colors"
            >
              {part}
            </Link>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
})
