import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Modals
  isComposeOpen: boolean
  openCompose: () => void
  closeCompose: () => void

  isProjectModalOpen: boolean
  openProjectModal: () => void
  closeProjectModal: () => void

  isJobModalOpen: boolean
  openJobModal: () => void
  closeJobModal: () => void

  isGroupModalOpen: boolean
  openGroupModal: () => void
  closeGroupModal: () => void

  // Notifications
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnread: () => void

  // Messages unread
  unreadMessages: number
  setUnreadMessages: (count: number) => void
  incrementUnreadMessages: () => void

  // Mobile Sidebar
  isMobileSidebarOpen: boolean
  setMobileSidebarOpen: (isOpen: boolean) => void

  // Sidebar Style
  sidebarStyle: 'full' | 'compact' | 'floating'
  setSidebarStyle: (style: 'full' | 'compact' | 'floating') => void

  // Language
  language: string
  setLanguage: (lang: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isComposeOpen: false,
      openCompose: () => set({ isComposeOpen: true }),
      closeCompose: () => set({ isComposeOpen: false }),

      isProjectModalOpen: false,
      openProjectModal: () => set({ isProjectModalOpen: true }),
      closeProjectModal: () => set({ isProjectModalOpen: false }),

      isJobModalOpen: false,
      openJobModal: () => set({ isJobModalOpen: true }),
      closeJobModal: () => set({ isJobModalOpen: false }),

      isGroupModalOpen: false,
      openGroupModal: () => set({ isGroupModalOpen: true }),
      closeGroupModal: () => set({ isGroupModalOpen: false }),

      unreadCount: 0,
      setUnreadCount: (count: number) => set({ unreadCount: count }),
      incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

      unreadMessages: 0,
      setUnreadMessages: (count: number) => set({ unreadMessages: count }),
      incrementUnreadMessages: () => set((state) => ({ unreadMessages: state.unreadMessages + 1 })),

      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),

      sidebarStyle: 'full',
      setSidebarStyle: (style) => set({ sidebarStyle: style }),

      language: 'es',
      setLanguage: (lang) => {
        if (typeof document !== 'undefined') {
          document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`
        }
        set({ language: lang })
      },
    }),
    {
      name: 'devcircle-ui-storage',
      // Solo persistimos lo que tiene sentido guardar (el estilo de la sidebar y el idioma)
      partialize: (state) => ({ sidebarStyle: state.sidebarStyle, language: state.language }),
    }
  )
)
