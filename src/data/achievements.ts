import type { Achievement } from '../types'

export const achievements: Achievement[] = [
  // 学习里程碑
  { id: 'first-root', title: '初学之根', description: '完成第1个词根学习', icon: '🌱', category: 'learning', threshold: 1, metric: 'roots', reward: 10 },
  { id: 'five-roots', title: '根基初成', description: '完成5个词根学习', icon: '🌿', category: 'learning', threshold: 5, metric: 'roots', reward: 20 },
  { id: 'ten-roots', title: '词根达人', description: '完成10个词根学习', icon: '🌳', category: 'learning', threshold: 10, metric: 'roots', reward: 30 },
  { id: 'twenty-roots', title: '词汇大师', description: '完成20个词根学习', icon: '🏆', category: 'learning', threshold: 20, metric: 'roots', reward: 50 },
  { id: 'fifty-words', title: '词汇积累', description: '学习50个单词', icon: '📚', category: 'learning', threshold: 50, metric: 'words', reward: 20 },
  { id: 'hundred-words', title: '词汇丰富', description: '学习100个单词', icon: '📖', category: 'learning', threshold: 100, metric: 'words', reward: 50 },
  { id: 'two-hundred-words', title: '词海遨游', description: '学习200个单词', icon: '🌊', category: 'learning', threshold: 200, metric: 'words', reward: 80 },

  // 连续打卡
  { id: 'streak-3', title: '三日不辍', description: '连续学习3天', icon: '🔥', category: 'streak', threshold: 3, metric: 'streak', reward: 10 },
  { id: 'streak-7', title: '一周坚持', description: '连续学习7天', icon: '⚡', category: 'streak', threshold: 7, metric: 'streak', reward: 20 },
  { id: 'streak-14', title: '半月恒心', description: '连续学习14天', icon: '💪', category: 'streak', threshold: 14, metric: 'streak', reward: 30 },
  { id: 'streak-30', title: '月度王者', description: '连续学习30天', icon: '👑', category: 'streak', threshold: 30, metric: 'streak', reward: 100 },
  { id: 'streak-100', title: '百日筑基', description: '连续学习100天', icon: '🏯', category: 'streak', threshold: 100, metric: 'streak', reward: 500 },

  // 练习成就
  { id: 'practice-10', title: '练习新手', description: '完成10次练习', icon: '✏️', category: 'practice', threshold: 10, metric: 'practices', reward: 10 },
  { id: 'practice-50', title: '练习能手', description: '完成50次练习', icon: '📝', category: 'practice', threshold: 50, metric: 'practices', reward: 30 },
  { id: 'practice-100', title: '练习狂人', description: '完成100次练习', icon: '🎯', category: 'practice', threshold: 100, metric: 'practices', reward: 50 },
  { id: 'perfect-score', title: '满分荣耀', description: '获得一次满分', icon: '💯', category: 'practice', threshold: 1, metric: 'perfect', reward: 15 },
  { id: 'perfect-10', title: '满分常客', description: '获得10次满分', icon: '🌟', category: 'practice', threshold: 10, metric: 'perfect', reward: 50 },
  { id: 'review-50', title: '复习达人', description: '复习50个单词', icon: '🔄', category: 'practice', threshold: 50, metric: 'reviews', reward: 20 },
  { id: 'review-500', title: '复习大师', description: '复习500个单词', icon: '🧠', category: 'practice', threshold: 500, metric: 'reviews', reward: 100 },

  // 等级成就
  { id: 'level-5', title: '初出茅庐', description: '达到等级5', icon: '⭐', category: 'level', threshold: 5, metric: 'level', reward: 20 },
  { id: 'level-10', title: '学有所成', description: '达到等级10', icon: '🌟', category: 'level', threshold: 10, metric: 'level', reward: 50 },
  { id: 'level-20', title: '登堂入室', description: '达到等级20', icon: '✨', category: 'level', threshold: 20, metric: 'level', reward: 100 },
  { id: 'level-50', title: '炉火纯青', description: '达到等级50', icon: '🏆', category: 'level', threshold: 50, metric: 'level', reward: 300 },

  // 社交成就
  { id: 'gems-100', title: '小有积蓄', description: '累计获得100宝石', icon: '💎', category: 'social', threshold: 100, metric: 'gems', reward: 0 },
  { id: 'gems-500', title: '宝石收藏家', description: '累计获得500宝石', icon: '💰', category: 'social', threshold: 500, metric: 'gems', reward: 0 },

  // 特殊成就
  { id: 'mastery-50', title: '半壁江山', description: '生词掌握率达到50%', icon: '🎯', category: 'special', threshold: 50, metric: 'mastery', reward: 30 },
  { id: 'wordbook-50', title: '收集爱好者', description: '生词本达到50个单词', icon: '📚', category: 'special', threshold: 50, metric: 'wordbook', reward: 20 },
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
