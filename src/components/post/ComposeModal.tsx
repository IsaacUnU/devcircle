'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { X, Code, Tag, Send, Hash, TrendingUp } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { MentionTextarea } from '@/components/ui/MentionTextarea'
import { createPost } from '@/lib/actions/posts'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const MAX_CHARS = 500

interface TagSuggestion {
  name: string
  _count: { posts: number }
}

export function ComposeModal() {
  const { isComposeOpen, closeCompose } = useUIStore()
  const [content, setContent] = useState('')
  const [codeSnip, setCodeSnip] = useState('')
  const [language, setLanguage] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showCode, setShowCode] = useState(false)
  const [isPending, startTransition] = useTransition()
  const firstRender = useRef(true)

  // — Autocomplete de tags —
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const fetchRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (isComposeOpen) firstRender.current = false
  }, [isComposeOpen])

  // Reset al cerrar
  useEffect(() => {
    if (!isComposeOpen) {
      setContent(''); setCodeSnip(''); setTags([])
      setTagInput(''); setShowCode(false)
      setSuggestions([]); setShowSuggestions(false)
    }
  }, [isComposeOpen])

  if (!isComposeOpen) return null

  const charCount = content.length
  const remaining = MAX_CHARS - charCount

  // ── Buscar sugerencias cuando cambia el input de tags ──────────────────
  function handleTagInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTagInput(val)
    setSelectedIdx(0)

    // Limpiar el # del inicio si lo escriben
    const query = val.replace(/^#/, '').toLowerCase().trim()

    if (query.length === 0) {
      // Sin texto: mostrar los más populares
      clearTimeout(fetchRef.current)
      fetchRef.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/tags?q=')
          const data: TagSuggestion[] = await res.json()
          // Filtrar los que ya están añadidos
          setSuggestions(data.filter(t => !tags.includes(t.name)))
          setShowSuggestions(data.length > 0)
        } catch { setShowSuggestions(false) }
      }, 100)
      return
    }

    clearTimeout(fetchRef.current)
    fetchRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(query)}`)
        const data: TagSuggestion[] = await res.json()
        const filtered = data.filter(t => !tags.includes(t.name))
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
      } catch { setShowSuggestions(false) }
    }, 150)
  }

  // ── Seleccionar un tag del dropdown ────────────────────────────────────
  function selectTag(tagName: string) {
    if (!tags.includes(tagName) && tags.length < 5) {
      setTags(prev => [...prev, tagName])
    }
    setTagInput('')
    setShowSuggestions(false)
    setSuggestions([])
  }

  // ── Navegar con teclado en el dropdown ─────────────────────────────────
  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Tab' || (e.key === 'Enter' && showSuggestions)) {
        e.preventDefault()
        if (suggestions[selectedIdx]) { selectTag(suggestions[selectedIdx].name); return }
      }
      if (e.key === 'Escape') { setShowSuggestions(false); return }
    }
    // Enter normal: añadir tag escrito manualmente
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/^#/, '').replace(/[^a-z0-9]/g, '')
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags(prev => [...prev, tag])
        setTagInput('')
        setShowSuggestions(false)
      }
    }
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  function handleSubmit() {
    if (!content.trim()) return
    startTransition(async () => {
      try {
        await createPost({ content, codeSnip: showCode ? codeSnip : undefined, language: showCode ? language : undefined, tags })
        toast.success('Post publicado 🚀')
        closeCompose()
      } catch (err: any) {
        toast.error(err.message ?? 'Error al publicar')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm sm:backdrop-blur-md animate-fade-in" onClick={closeCompose} />

      <div className="relative w-full sm:max-w-lg bg-surface sm:bg-transparent animate-slide-up mt-auto sm:mt-0 max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.5)] sm:shadow-none">
        <div className="card p-5 sm:p-6 shadow-2xl glass border-t sm:border border-brand-500/20 overflow-visible rounded-t-3xl sm:rounded-2xl bg-surface/95 sm:bg-surface/80 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="w-12 h-1.5 bg-surface-border rounded-full mx-auto mb-6 sm:hidden shrink-0" />
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Nuevo post</h2>
            <button onClick={closeCompose} className="btn-ghost p-2 -mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Textarea con soporte de @menciones y #hashtags */}
          <MentionTextarea
            value={content}
            onChange={setContent}
            placeholder="¿Qué estás construyendo? Comparte tu código, idea o pregunta..."
            className="input resize-none h-28 text-sm"
            autoFocus={isComposeOpen}
          />

          {/* Char counter */}
          <div className="flex justify-end mt-1 mb-3">
            <span className={cn('text-xs', remaining < 50 ? 'text-red-400' : 'text-text-muted')}>
              {remaining}
            </span>
          </div>

          {/* Code toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowCode(prev => !prev)}
              className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all',
                showCode
                  ? 'border-brand-500 text-brand-400 bg-brand-500/10'
                  : 'border-surface-border text-text-muted hover:border-brand-500 hover:text-brand-400'
              )}
            >
              <Code className="w-3.5 h-3.5" />
              Añadir código
            </button>
          </div>

          {/* Code editor */}
          {showCode && (
            <div className="mb-3 animate-slide-up space-y-2">
              <input
                value={language}
                onChange={e => setLanguage(e.target.value)}
                placeholder="Lenguaje (ej: typescript, python...)"
                className="input text-sm py-1.5"
              />
              <textarea
                value={codeSnip}
                onChange={e => setCodeSnip(e.target.value)}
                placeholder="// Pega tu código aquí"
                className="input font-mono text-xs h-32 resize-none"
              />
            </div>
          )}

          {/* Tags — EL AUTOCOMPLETE VIVE AQUÍ */}
          <div className="mb-4">
            {/* Tags añadidos */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                  <button key={tag} onClick={() => removeTag(tag)} className="tag group">
                    #{tag}
                    <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {/* Input de tag con dropdown */}
            {tags.length < 5 && (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <input
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    onFocus={handleTagInputChange as any}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Busca o escribe un tag..."
                    className="input py-1.5 text-sm"
                    autoComplete="off"
                  />
                </div>

                {/* Dropdown de sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-6 right-0 top-full mt-1 z-50 card border border-surface-border shadow-xl overflow-hidden animate-fade-in">
                    <div className="px-3 py-1.5 border-b border-surface-border flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-brand-400" />
                      <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">
                        Tags populares
                      </span>
                    </div>
                    {suggestions.map((sug, i) => (
                      <button
                        key={sug.name}
                        onMouseDown={e => { e.preventDefault(); selectTag(sug.name) }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left',
                          i === selectedIdx
                            ? 'bg-brand-500/15 text-brand-400'
                            : 'text-text-secondary hover:bg-surface-2'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-brand-500/60" />
                          <span className="font-medium">{sug.name}</span>
                        </div>
                        <span className="text-xs text-text-muted">{sug._count.posts} posts</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-border">
            <span className="text-xs text-text-muted">{tags.length}/5 tags</span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {isPending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
