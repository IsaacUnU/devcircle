import { create } from 'zustand'

interface UIStore {
  // Compose post modal
  isComposeOpen: boolean
  openCompose:   () => void
  closeCompose:  () => void

  // Notification count
  unreadCount:    number
  setUnreadCount: (n: number) => void

  // Active tab in profile
  profileTab: 'posts' | 'bookmarks'
  setProfileTab: (tab: 'posts' | 'bookmarks') => void
}

export const useUIStore = create<UIStore>((set) => ({
  isComposeOpen:  false,
  openCompose:    () => set({ isComposeOpen: true }),
  closeCompose:   () => set({ isComposeOpen: false }),

  unreadCount:    0,
  setUnreadCount: (n) => set({ unreadCount: n }),

  profileTab:    'posts',
  setProfileTab: (tab) => set({ profileTab: tab }),
}))
