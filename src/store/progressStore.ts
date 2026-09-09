import { create } from 'zustand'
import type { UnitStatus, PracticeResult } from '../types'

interface ProgressState {
  unitStatuses: Record<string, UnitStatus>
  practiceCount: number
  learnedDates: string[]
  lastPracticeDate: string | null
  practiceResults: PracticeResult[]
  markUnitInProgress: (unitId: string) => void
  markUnitCompleted: (unitId: string) => void
  recordPractice: (result: Omit<PracticeResult, 'date'>) => void
  getStreakDays: () => number
  reset: () => void
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort()
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const lastDate = sorted[sorted.length - 1]
  if (lastDate !== today && lastDate !== yesterday) return 0

  let streak = 0
  let cur = new Date(lastDate)
  const set = new Set(sorted)
  while (set.has(cur.toISOString().split('T')[0])) {
    streak++
    cur = new Date(cur.getTime() - 86400000)
  }
  return streak
}

export const useProgressStore = create<ProgressState>()(
  (set, get) => ({
    unitStatuses: {},
    practiceCount: 0,
    learnedDates: [],
    lastPracticeDate: null,
    practiceResults: [],

    markUnitInProgress: (unitId) =>
      set((state) => {
        if (state.unitStatuses[unitId] === 'completed') return state
        return {
          unitStatuses: { ...state.unitStatuses, [unitId]: 'in_progress' },
        }
      }),

    markUnitCompleted: (unitId) =>
      set((state) => {
        const today = todayStr()
        const dates = state.learnedDates.includes(today)
          ? state.learnedDates
          : [...state.learnedDates, today]
        return {
          unitStatuses: { ...state.unitStatuses, [unitId]: 'completed' },
          learnedDates: dates,
          lastPracticeDate: today,
        }
      }),

    recordPractice: (result) =>
      set((state) => {
        const today = todayStr()
        const dates = state.learnedDates.includes(today)
          ? state.learnedDates
          : [...state.learnedDates, today]
        return {
          practiceCount: state.practiceCount + 1,
          learnedDates: dates,
          lastPracticeDate: today,
          practiceResults: [
            ...state.practiceResults,
            { ...result, date: today },
          ],
        }
      }),

    getStreakDays: () => calcStreak(get().learnedDates),

    reset: () =>
      set({
        unitStatuses: {},
        practiceCount: 0,
        learnedDates: [],
        lastPracticeDate: null,
        practiceResults: [],
      }),
  })
)

// Per-user persistence helper
const STORAGE_PREFIX = 'wordroot-progress-'

export function loadProgress(username: string) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + username)
    if (!raw) return
    const data = JSON.parse(raw)
    useProgressStore.setState({
      unitStatuses: data.unitStatuses || {},
      practiceCount: data.practiceCount || 0,
      learnedDates: data.learnedDates || [],
      lastPracticeDate: data.lastPracticeDate || null,
      practiceResults: data.practiceResults || [],
    })
  } catch {
    // ignore
  }
}

export function saveProgress(username: string) {
  const state = useProgressStore.getState()
  localStorage.setItem(
    STORAGE_PREFIX + username,
    JSON.stringify({
      unitStatuses: state.unitStatuses,
      practiceCount: state.practiceCount,
      learnedDates: state.learnedDates,
      lastPracticeDate: state.lastPracticeDate,
      practiceResults: state.practiceResults,
    })
  )
}
