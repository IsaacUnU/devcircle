'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { X, Code, Tag, Send } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { createPost } from '@/lib/actions/posts'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const MAX_CHARS = 500

export function ComposeModal() {
  const { isComposeOpen, closeCompose } = useUIStore()
  const [content, setContent] = useState('')
  const [codeSnip, setCodeSnip] = useState('')
  const [language, setLanguage] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showCode, setShowCode] = useState(false)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isComposeOpen) textareaRef.current?.focus()
  }, [isComposeOpen])

  if (!isComposeOpen) return null

  const charCount = content.length
  const remaining = MAX_CHARS - charCount

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags(prev => [...prev, tag])
        setTagInput('')
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
        setContent(''); setCodeSnip(''); setTags([]); setShowCode(false)
        closeCompose()
      } catch (err: any) {
        toast.error(err.message ?? 'Error al publicar')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={closeCompose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-up">
        <div className="card p-6 shadow-2xl overflow-hidden glass">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Nuevo post</h2>
            <button onClick={closeCompose} className="btn-ghost p-2 -mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="¿Qué estás construyendo? Comparte tu código, idea o pregunta..."
            className="input resize-none h-28 text-sm"
            maxLength={MAX_CHARS}
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

          {/* Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <button key={tag} onClick={() => removeTag(tag)} className="tag group">
                  #{tag}
                  <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            {tags.length < 5 && (
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-text-muted" />
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Añadir tag (Enter para confirmar)"
                  className="input py-1.5 text-sm"
                />
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
