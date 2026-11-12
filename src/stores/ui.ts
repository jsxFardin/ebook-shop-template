import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Panel = null | 'categories' | 'cart' | 'filters'
interface Toast { id: number; text: string; tone: 'ok' | 'info' }

interface UiState {
  theme: 'light' | 'dark'
  panel: Panel
  quickView: string | null
  toasts: Toast[]
  recent: string[]
  district: string
  setDistrict: (d: string) => void
  toggleTheme: () => void
  open: (p: Panel) => void
  close: () => void
  setQuickView: (id: string | null) => void
  toast: (text: string, tone?: Toast['tone']) => void
  viewed: (id: string) => void
}

let tid = 0
export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      panel: null,
      quickView: null,
      toasts: [],
      recent: [],
      district: 'Dhaka',
      setDistrict: (district) => set({ district }),
      toggleTheme: () => {
        const theme = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },
      open: (panel) => set({ panel }),
      close: () => set({ panel: null }),
      setQuickView: (quickView) => set({ quickView }),
      toast: (text, tone = 'ok') => {
        const id = ++tid
        set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, tone }] }))
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600)
      },
      viewed: (id) => set((s) => ({ recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 10) })),
    }),
    { name: 'mb-ui', partialize: (s) => ({ theme: s.theme, recent: s.recent, district: s.district }) },
  ),
)
