import { create } from 'zustand'
import type { UnitStatus, PracticeResult, DailyGoal, DailyCompletion, LeaderboardEntry } from '../types'

interface ProgressState {
  // 原有
  unitStatuses: Record<string, UnitStatus>
  practiceCount: number
  learnedDates: string[]
  lastPracticeDate: string | null
  practiceResults: PracticeResult[]

  // 游戏化
  xp: number
  hearts: number
  maxHearts: number
  gems: number
  streakFreeze: number  // 连胜冻结道具数量
  totalReviews: number  // 总复习次数

  // 每日目标
  dailyGoal: DailyGoal
  dailyCompletion: DailyCompletion
  lastDailyDate: string

  // 排行榜（本地模拟）
  leaderboard: LeaderboardEntry[]

  // 方法
  markUnitInProgress: (unitId: string) => void
  markUnitCompleted: (unitId: string, wordsCount?: number) => void
  recordPractice: (result: Omit<PracticeResult, 'date'>) => void
  getStreakDays: () => number
  addXP: (amount: number) => number  // 返回增加后的 XP
  addGems: (amount: number) => void
  loseHeart: () => boolean  // 心数是否耗尽
  refillHearts: () => void  // 用宝石恢复心
  useStreakFreeze: () => boolean
  setDailyGoal: (goal: Partial<DailyGoal>) => void
  recordDailyWords: (count: number) => void
  recordDailyReview: (count: number) => void
  isDailyGoalComplete: () => boolean
  regenerateLeaderboard: () => void
  reset: () => void
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00')
  const db = new Date(b + 'T00:00:00')
  return Math.round((db.getTime() - da.getTime()) / 86400000)
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

// 本地模拟排行榜的虚拟用户
const BOT_NAMES = [
  '词根小达人', '背词狂魔', 'EnglishPro', '词汇猎手', '记忆大师',
  'WordNinja', '词根侦探', '学霸小明', 'EtymologyFan', '单词收藏家',
  'RootExplorer', '过目不忘', 'VocabMaster', '词源学者', '每日背词人',
]

function genLeaderboard(currentXp: number, currentStreak: number, currentLevel: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = BOT_NAMES.map(name => {
    const xp = Math.floor(500 + Math.random() * 8000)
    return {
      username: name,
      xp,
      streak: Math.floor(1 + Math.random() * 60),
      level: Math.max(1, Math.floor(Math.sqrt(xp / 50))),
    }
  })
  entries.push({
    username: '我',
    xp: currentXp,
    streak: currentStreak,
    level: currentLevel,
    isCurrentUser: true,
  })
  return entries.sort((a, b) => b.xp - a.xp)
}

function emptyDailyCompletion(date: string): DailyCompletion {
  return { date, wordsLearned: 0, wordsReviewed: 0, practicesDone: 0 }
}

export const useProgressStore = create<ProgressState>()(
  (set, get) => ({
    unitStatuses: {},
    practiceCount: 0,
    learnedDates: [],
    lastPracticeDate: null,
    practiceResults: [],
    xp: 0,
    hearts: 5,
    maxHearts: 5,
    gems: 50,
    streakFreeze: 1,
    totalReviews: 0,
    dailyGoal: { dailyWords: 10, dailyReview: 15, dailyPractice: 1 },
    dailyCompletion: emptyDailyCompletion(todayStr()),
    lastDailyDate: todayStr(),
    leaderboard: [],

    markUnitInProgress: (unitId) =>
      set((state) => {
        if (state.unitStatuses[unitId] === 'completed') return state
        return {
          unitStatuses: { ...state.unitStatuses, [unitId]: 'in_progress' },
        }
      }),

    markUnitCompleted: (unitId, wordsCount) =>
      set((state) => {
        const today = todayStr()
        const dates = state.learnedDates.includes(today)
          ? state.learnedDates
          : [...state.learnedDates, today]
        const wordsLearned = wordsCount ?? 0
        const newCompletion = {
          ...state.dailyCompletion,
          wordsLearned: state.dailyCompletion.wordsLearned + wordsLearned,
        }
        return {
          unitStatuses: { ...state.unitStatuses, [unitId]: 'completed' },
          learnedDates: dates,
          lastPracticeDate: today,
          xp: state.xp + wordsLearned * 2,
          dailyCompletion: newCompletion,
        }
      }),

    recordPractice: (result) =>
      set((state) => {
        const today = todayStr()
        const dates = state.learnedDates.includes(today)
          ? state.learnedDates
          : [...state.learnedDates, today]
        const accuracy = result.total > 0 ? result.correct / result.total : 0
        const xpEarned = Math.round(result.correct * 3 + (accuracy >= 0.8 ? 10 : 0))
        return {
          practiceCount: state.practiceCount + 1,
          learnedDates: dates,
          lastPracticeDate: today,
          xp: state.xp + xpEarned,
          practiceResults: [
            ...state.practiceResults,
            { ...result, date: today, xpEarned },
          ],
          dailyCompletion: {
            ...state.dailyCompletion,
            practicesDone: state.dailyCompletion.practicesDone + 1,
          },
        }
      }),

    getStreakDays: () => calcStreak(get().learnedDates),

    addXP: (amount) => {
      set((s) => ({ xp: s.xp + amount }))
      return get().xp
    },

    addGems: (amount) => set((s) => ({ gems: Math.max(0, s.gems + amount) })),

    loseHeart: () => {
      const cur = get().hearts
      if (cur <= 0) return false
      set({ hearts: cur - 1 })
      return true
    },

    refillHearts: () => {
      const s = get()
      if (s.gems >= 35) {
        set({ gems: s.gems - 35, hearts: s.maxHearts })
      }
    },

    useStreakFreeze: () => {
      const s = get()
      if (s.streakFreeze <= 0) return false
      set({ streakFreeze: s.streakFreeze - 1 })
      return true
    },

    setDailyGoal: (goal) =>
      set((s) => ({ dailyGoal: { ...s.dailyGoal, ...goal } })),

    recordDailyWords: (count) =>
      set((s) => ({
        dailyCompletion: {
          ...s.dailyCompletion,
          wordsLearned: s.dailyCompletion.wordsLearned + count,
        },
      })),

    recordDailyReview: (count) =>
      set((s) => ({
        totalReviews: s.totalReviews + count,
        dailyCompletion: {
          ...s.dailyCompletion,
          wordsReviewed: s.dailyCompletion.wordsReviewed + count,
        },
      })),

    isDailyGoalComplete: () => {
      const s = get()
      const g = s.dailyGoal
      const c = s.dailyCompletion
      return c.wordsLearned >= g.dailyWords &&
        c.wordsReviewed >= g.dailyReview &&
        c.practicesDone >= g.dailyPractice
    },

    regenerateLeaderboard: () => {
      const s = get()
      const streak = calcStreak(s.learnedDates)
      const level = Math.floor(Math.sqrt(s.xp / 50)) + 1
      set({ leaderboard: genLeaderboard(s.xp, streak, level) })
    },

    reset: () =>
      set({
        unitStatuses: {},
        practiceCount: 0,
        learnedDates: [],
        lastPracticeDate: null,
        practiceResults: [],
        xp: 0,
        hearts: 5,
        gems: 50,
        streakFreeze: 1,
        totalReviews: 0,
        dailyCompletion: emptyDailyCompletion(todayStr()),
        leaderboard: [],
      }),
  })
)

// Per-user persistence helper
const STORAGE_PREFIX = 'wordroot-progress-'

export function loadProgress(username: string) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + username)
    if (!raw) {
      // 新用户初始化排行榜
      useProgressStore.getState().regenerateLeaderboard()
      return
    }
    const data = JSON.parse(raw)
    const today = todayStr()
    const dailyCompletion =
      data.lastDailyDate === today
        ? data.dailyCompletion
        : emptyDailyCompletion(today)

    // 检查连胜是否需要冻结
    let learnedDates = data.learnedDates || []
    const lastDate = learnedDates[learnedDates.length - 1]
    if (lastDate && daysBetween(lastDate, today) > 1) {
      // 断签了，尝试用 streak freeze 弥补
      if ((data.streakFreeze ?? 1) > 0) {
        data.streakFreeze = (data.streakFreeze ?? 1) - 1
        // 补上昨天
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        if (!learnedDates.includes(yesterday)) {
          learnedDates = [...learnedDates, yesterday].sort()
        }
      }
    }

    useProgressStore.setState({
      unitStatuses: data.unitStatuses || {},
      practiceCount: data.practiceCount || 0,
      learnedDates,
      lastPracticeDate: data.lastPracticeDate || null,
      practiceResults: data.practiceResults || [],
      xp: data.xp || 0,
      hearts: data.hearts ?? 5,
      gems: data.gems ?? 50,
      streakFreeze: data.streakFreeze ?? 1,
      totalReviews: data.totalReviews || 0,
      dailyGoal: data.dailyGoal || { dailyWords: 10, dailyReview: 15, dailyPractice: 1 },
      dailyCompletion,
      lastDailyDate: today,
    })
    useProgressStore.getState().regenerateLeaderboard()
  } catch {
    useProgressStore.getState().regenerateLeaderboard()
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
      xp: state.xp,
      hearts: state.hearts,
      gems: state.gems,
      streakFreeze: state.streakFreeze,
      totalReviews: state.totalReviews,
      dailyGoal: state.dailyGoal,
      dailyCompletion: state.dailyCompletion,
      lastDailyDate: todayStr(),
    })
  )
}
