import { create } from 'zustand'

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
}

export const useUIStore = create<UIState>((set) => ({
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
}))
