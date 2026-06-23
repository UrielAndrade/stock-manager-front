import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state: UIState) => ({ sidebarOpen: !state.sidebarOpen })),
}))

// ─────────────────────────────────────────────────────────────────────────────

interface SettingsState {
  apiBaseUrl: string
  setApiBaseUrl: (url: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiBaseUrl: 'http://localhost:8080',
      setApiBaseUrl: (url: string) => set({ apiBaseUrl: url }),
    }),
    { name: 'stock-manager-settings' },
  ),
)

// ─────────────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (n: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (n: Omit<Notification, 'id'>) =>
    set((state: NotificationState) => ({
      notifications: [
        ...state.notifications,
        { ...n, id: crypto.randomUUID() },
      ],
    })),
  removeNotification: (id: string) =>
    set((state: NotificationState) => ({
      notifications: state.notifications.filter((n: Notification) => n.id !== id),
    })),
}))
