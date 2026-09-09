import { create } from 'zustand'
import type { WordBookEntry, ReviewQuality, WordPart } from '../types'

interface WordBookState {
  entries: WordBookEntry[]
  addWord: (entry: Omit<WordBookEntry, 'addedAt' | 'easeFactor' | 'interval' | 'repetitions' | 'lapses' | 'lastReview' | 'nextReview' | 'reviewCount' | 'correctCount'>) => void
  removeWord: (word: string) => void
  hasWord: (word: string) => boolean
  // SRS 复习
  reviewWord: (word: string, quality: ReviewQuality) => void
  getDueWords: () => WordBookEntry[]
  getMasteryRate: () => number
  reset: () => void
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// SM-2 间隔重复算法
function sm2(entry: WordBookEntry, quality: ReviewQuality): Partial<WordBookEntry> {
  // quality 映射: again=0, hard=1, good=2, easy=3
  const q = quality === 'again' ? 0 : quality === 'hard' ? 1 : quality === 'good' ? 2 : 3

  let easeFactor = entry.easeFactor
  let interval = entry.interval
  let repetitions = entry.repetitions
  let lapses = entry.lapses

  if (q < 2) {
    // 答错：重置连续次数，间隔1天，遗忘次数+1
    repetitions = 0
    interval = 1
    lapses += 1
  } else {
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 3
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  // 更新 ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
  )

  const today = todayStr()
  return {
    easeFactor,
    interval,
    repetitions,
    lapses,
    lastReview: today,
    nextReview: addDays(today, interval),
    reviewCount: entry.reviewCount + 1,
    correctCount: entry.correctCount + (q >= 2 ? 1 : 0),
  }
}

export const useWordBookStore = create<WordBookState>()((set, get) => ({
  entries: [],

  addWord: (entry) =>
    set((state) => {
      if (state.entries.some(e => e.word === entry.word)) return state
      const today = todayStr()
      const newEntry: WordBookEntry = {
        ...entry,
        addedAt: new Date().toISOString(),
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        lapses: 0,
        lastReview: null,
        nextReview: today, // 新加入的词今天就该复习
        reviewCount: 0,
        correctCount: 0,
      }
      return { entries: [...state.entries, newEntry] }
    }),

  removeWord: (word) =>
    set((state) => ({
      entries: state.entries.filter(e => e.word !== word),
    })),

  hasWord: (word) => get().entries.some(e => e.word === word),

  reviewWord: (word, quality) =>
    set((state) => ({
      entries: state.entries.map(e =>
        e.word === word ? { ...e, ...sm2(e, quality) } : e
      ),
    })),

  getDueWords: () => {
    const today = todayStr()
    return get().entries.filter(e => e.nextReview <= today)
  },

  getMasteryRate: () => {
    const entries = get().entries
    if (entries.length === 0) return 0
    const mastered = entries.filter(e => e.repetitions >= 3 && e.lapses === 0).length
    return Math.round((mastered / entries.length) * 100)
  },

  reset: () => set({ entries: [] }),
}))

const STORAGE_PREFIX = 'wordroot-wordbook-'

export function loadWordBook(username: string) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + username)
    if (!raw) return
    const data = JSON.parse(raw)
    // 兼容旧数据：为没有 SRS 字段的条目补默认值
    const entries: WordBookEntry[] = (data.entries || []).map((e: Partial<WordBookEntry>) => ({
      word: e.word || '',
      meaning: e.meaning || '',
      phonetic: e.phonetic || '',
      rootId: e.rootId || '',
      rootForm: e.rootForm || '',
      rootMeaning: e.rootMeaning || '',
      parts: (e.parts || []) as WordPart[],
      addedAt: e.addedAt || new Date().toISOString(),
      easeFactor: e.easeFactor ?? 2.5,
      interval: e.interval ?? 0,
      repetitions: e.repetitions ?? 0,
      lapses: e.lapses ?? 0,
      lastReview: e.lastReview ?? null,
      nextReview: e.nextReview ?? todayStr(),
      reviewCount: e.reviewCount ?? 0,
      correctCount: e.correctCount ?? 0,
    }))
    useWordBookStore.setState({ entries })
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
