import type { Achievement } from '../types'

export const achievements: Achievement[] = [
  // 学习里程碑
  { id: 'first-root', title: '初学之根', description: '完成第1个词根学习', icon: '🌱', category: 'learning', threshold: 1, metric: 'roots' },
  { id: 'five-roots', title: '根基初成', description: '完成5个词根学习', icon: '🌿', category: 'learning', threshold: 5, metric: 'roots' },
  { id: 'ten-roots', title: '词根达人', description: '完成10个词根学习', icon: '🌳', category: 'learning', threshold: 10, metric: 'roots' },
  { id: 'twenty-roots', title: '词汇大师', description: '完成20个词根学习', icon: '🏆', category: 'learning', threshold: 20, metric: 'roots' },
  { id: 'fifty-words', title: '词汇积累', description: '学习50个单词', icon: '📚', category: 'learning', threshold: 50, metric: 'words' },
  { id: 'hundred-words', title: '词汇丰富', description: '学习100个单词', icon: '📖', category: 'learning', threshold: 100, metric: 'words' },

  // 连续打卡
  { id: 'streak-3', title: '三日不辍', description: '连续学习3天', icon: '🔥', category: 'streak', threshold: 3, metric: 'streak' },
  { id: 'streak-7', title: '一周坚持', description: '连续学习7天', icon: '⚡', category: 'streak', threshold: 7, metric: 'streak' },
  { id: 'streak-30', title: '月度王者', description: '连续学习30天', icon: '👑', category: 'streak', threshold: 30, metric: 'streak' },

  // 练习成就
  { id: 'practice-10', title: '练习新手', description: '完成10次练习', icon: '✏️', category: 'practice', threshold: 10, metric: 'practices' },
  { id: 'practice-50', title: '练习能手', description: '完成50次练习', icon: '📝', category: 'practice', threshold: 50, metric: 'practices' },
  { id: 'perfect-score', title: '满分荣耀', description: '获得一次满分', icon: '💯', category: 'practice', threshold: 1, metric: 'perfect' },

  // 等级成就
  { id: 'level-5', title: '初出茅庐', description: '达到等级5', icon: '⭐', category: 'level', threshold: 5, metric: 'level' },
  { id: 'level-10', title: '学有所成', description: '达到等级10', icon: '🌟', category: 'level', threshold: 10, metric: 'level' },
]

export function calcLevel(roots: number, words: number, practices: number): number {
  const exp = roots * 10 + words * 2 + practices * 5
  return Math.floor(Math.sqrt(exp / 10)) + 1
}

export function calcExp(roots: number, words: number, practices: number): number {
  return roots * 10 + words * 2 + practices * 5
}

export function expForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 10
}

export function expToNext(currentLevel: number, exp: number): { current: number; needed: number; progress: number } {
  const currentLevelExp = expForLevel(currentLevel)
  const nextLevelExp = expForLevel(currentLevel + 1)
  const levelRange = nextLevelExp - currentLevelExp
  const currentInLevel = exp - currentLevelExp
  const progress = levelRange > 0 ? Math.min(100, Math.round((currentInLevel / levelRange) * 100)) : 100
  return { current: currentInLevel, needed: levelRange, progress }
}
