import { create } from 'zustand'
import type { WordBookEntry } from '../types'

interface WordBookState {
  entries: WordBookEntry[]
  addWord: (entry: Omit<WordBookEntry, 'addedAt'>) => void
  removeWord: (word: string) => void
  hasWord: (word: string) => boolean
  reset: () => void
}

export const useWordBookStore = create<WordBookState>()((set, get) => ({
  entries: [],

  addWord: (entry) =>
    set((state) => {
      if (state.entries.some(e => e.word === entry.word)) return state
      return {
        entries: [
          ...state.entries,
          { ...entry, addedAt: new Date().toISOString() },
        ],
      }
    }),

  removeWord: (word) =>
    set((state) => ({
      entries: state.entries.filter(e => e.word !== word),
    })),

  hasWord: (word) => get().entries.some(e => e.word === word),

  reset: () => set({ entries: [] }),
}))

const STORAGE_PREFIX = 'wordroot-wordbook-'

export function loadWordBook(username: string) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + username)
    if (!raw) return
    const data = JSON.parse(raw)
    useWordBookStore.setState({ entries: data.entries || [] })
  } catch {
    // ignore
  }
}

export function saveWordBook(username: string) {
  const state = useWordBookStore.getState()
  localStorage.setItem(
    STORAGE_PREFIX + username,
    JSON.stringify({ entries: state.entries })
  )
}
