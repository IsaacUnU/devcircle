'use client'

import { useRef, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { getAvatarUrl } from '@/lib/utils'
import { Hash, AtSign, Loader2 } from 'lucide-react'
import {
  useMentionHashtag,
  UserSuggestion,
  TagSuggestion,
} from '@/hooks/useMentionHashtag'

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  /** Nodo que se renderiza absolute bottom-right (ej: botón Send) */
  action?: ReactNode
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  action,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    mode, users, tags, selectedIndex, loading,
    handleChange, handleKeyDown, pickUser, pickTag, setSelectedIndex, close,
  } = useMentionHashtag()

  const getCursor = useCallback(
    () => textareaRef.current?.selectionStart ?? 0,
    [] // solo necesita la ref, no el valor
  )

  const onInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    const cursor = e.target.selectionStart ?? val.length
    onChange(val)
    handleChange(val, cursor)
  }, [onChange, handleChange])

  const applyUser = useCallback((user: UserSuggestion) => {
    const cursor = getCursor()
    const next = pickUser(user, value, cursor)
    onChange(next)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      // posiciona cursor justo después del username + espacio
      const pos = next.lastIndexOf(`@${user.username}`) + user.username.length + 2
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(pos, pos)
    })
  }, [getCursor, pickUser, value, onChange])

  const applyTag = useCallback((tag: TagSuggestion) => {
    const cursor = getCursor()
    const next = pickTag(tag, value, cursor)
    onChange(next)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [getCursor, pickTag, value, onChange])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const consumed = handleKeyDown(e)
    if (consumed) return
    if (e.key === 'Enter' && mode) {
      if (mode === 'mention' && users[selectedIndex]) {
        e.preventDefault(); applyUser(users[selectedIndex])
      } else if (mode === 'hashtag' && tags[selectedIndex]) {
        e.preventDefault(); applyTag(tags[selectedIndex])
      }
    }
  }, [handleKeyDown, mode, users, tags, selectedIndex, applyUser, applyTag])

  const showDropdown = !!mode && (loading || users.length > 0 || tags.length > 0)

  return (
    // Este div es el único "relative" — el dropdown se posiciona respecto a él
    // y el Send button también, sin interferencias
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onInput}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(close, 150)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
      />

      {/* Slot para el botón de acción (Send, etc.) */}
      {action && (
        <div className="absolute right-2 bottom-1.5">
          {action}
        </div>
      )}

      {/* ── Dropdown de sugerencias ── */}
      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">

          {loading && (
            <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-text-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Buscando...
            </div>
          )}

          {/* Usuarios (@) */}
          {mode === 'mention' && !loading && users.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-text-muted italic">Sin resultados</p>
          )}
          {mode === 'mention' && !loading && users.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseDown={e => { e.preventDefault(); applyUser(user) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
                i === selectedIndex ? 'bg-brand-500/10' : 'hover:bg-surface-hover'
              )}
            >
              <img
                src={user.image ?? getAvatarUrl(user.username)}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate leading-none mb-0.5">
                  {user.name ?? user.username}
                </p>
                <p className="text-xs text-text-muted flex items-center gap-0.5">
                  <AtSign className="w-3 h-3 opacity-50 shrink-0" />
                  <span className="truncate">{user.username}</span>
                </p>
              </div>
            </button>
          ))}

          {/* Hashtags (#) */}
          {mode === 'hashtag' && !loading && tags.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-text-muted italic">Sin etiquetas encontradas</p>
          )}
          {mode === 'hashtag' && !loading && tags.map((tag, i) => (
            <button
              key={tag.name}
              type="button"
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseDown={e => { e.preventDefault(); applyTag(tag) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
                i === selectedIndex ? 'bg-brand-500/10' : 'hover:bg-surface-hover'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                i === selectedIndex ? 'bg-brand-500/20' : 'bg-surface-hover'
              )}>
                <Hash className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate leading-none mb-0.5">
                  #{tag.name}
                </p>
                <p className="text-xs text-text-muted">
                  {tag._count.posts} {tag._count.posts === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
