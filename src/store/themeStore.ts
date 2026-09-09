import { create } from 'zustand'
import type { ThemeMode } from '../types'

interface ThemeState {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

const STORAGE_KEY = 'wordroot-theme'

function getInitialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* ignore */ }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  mode: getInitialMode(),
  toggle: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark'
    set({ mode: next })
    applyTheme(next)
  },
  setMode: (mode) => {
    set({ mode })
    applyTheme(mode)
  },
}))

function applyTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch { /* ignore */ }
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// 初始化时应用一次主题
applyTheme(getInitialMode())
