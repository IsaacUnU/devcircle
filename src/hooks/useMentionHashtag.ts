'use client'

import { useState, useCallback, useRef } from 'react'

export interface UserSuggestion {
  id: string
  username: string
  name: string | null
  image: string | null
}

export interface TagSuggestion {
  name: string
  _count: { posts: number }
}

export type SuggestionMode = 'mention' | 'hashtag' | null

interface UseMentionHashtagReturn {
  mode: SuggestionMode
  users: UserSuggestion[]
  tags: TagSuggestion[]
  selectedIndex: number
  loading: boolean
  handleChange: (value: string, cursorPos: number) => void
  handleKeyDown: (e: React.KeyboardEvent) => boolean
  pickUser: (user: UserSuggestion, value: string, cursorPos: number) => string
  pickTag: (tag: TagSuggestion, value: string, cursorPos: number) => string
  close: () => void
  setSelectedIndex: (i: number) => void
}

export function useMentionHashtag(): UseMentionHashtagReturn {
  const [mode, setMode] = useState<SuggestionMode>(null)
  const [users, setUsers] = useState<UserSuggestion[]>([])
  const [tags, setTags] = useState<TagSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => {
    setMode(null)
    setUsers([])
    setTags([])
    setSelectedIndex(0)
    setLoading(false)
  }, [])

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true)
    try {
      // q vacío → trae todos (top usuarios), q con texto → filtra
      const url = q
        ? `/api/users/search?q=${encodeURIComponent(q)}`
        : `/api/users/search?q=`
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
      setSelectedIndex(0)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTags = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const url = q
        ? `/api/tags?q=${encodeURIComponent(q)}`
        : `/api/tags?q=`
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      setTags(Array.isArray(data) ? data : [])
      setSelectedIndex(0)
    } catch {
      setTags([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = useCallback((value: string, cursorPos: number) => {
    const textBefore = value.slice(0, cursorPos)

    // Detecta @palabra o @ solo (sin espacio después)
    const mentionMatch = textBefore.match(/@([a-zA-Z0-9_]*)$/)
    // Detecta #palabra o # solo
    const hashMatch = textBefore.match(/#([a-zA-Z0-9_]*)$/)

    if (mentionMatch) {
      const q = mentionMatch[1] // puede ser string vacío si solo se escribió @
      setMode('mention')
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchUsers(q), 150)
    } else if (hashMatch) {
      const q = hashMatch[1]
      setMode('hashtag')
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => fetchTags(q), 150)
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      close()
    }
  }, [fetchUsers, fetchTags, close])

  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    const list = mode === 'mention' ? users : tags
    if (!mode || list.length === 0) return false

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % list.length)
      return true
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i - 1 + list.length) % list.length)
      return true
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return true
    }
    return false
  }, [mode, users, tags, close])

  const pickUser = useCallback((user: UserSuggestion, value: string, cursorPos: number): string => {
    const before = value.slice(0, cursorPos)
    const after = value.slice(cursorPos)
    const replaced = before.replace(/@([a-zA-Z0-9_]*)$/, `@${user.username} `)
    close()
    return replaced + after
  }, [close])

  const pickTag = useCallback((tag: TagSuggestion, value: string, cursorPos: number): string => {
    const before = value.slice(0, cursorPos)
    const after = value.slice(cursorPos)
    const replaced = before.replace(/#([a-zA-Z0-9_]*)$/, `#${tag.name} `)
    close()
    return replaced + after
  }, [close])

  return {
    mode, users, tags, selectedIndex, loading,
    handleChange, handleKeyDown, pickUser, pickTag, close, setSelectedIndex,
  }
}
