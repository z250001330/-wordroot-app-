import { Link } from 'react-router-dom'
import { allUnits } from '../data/courseData'
import { useProgressStore } from '../store/progressStore'
import { achievements, calcLevel, calcExp, expForLevel } from '../data/achievements'
import type { Achievement } from '../types'

const categoryConfig: Record<string, { label: string; color: string }> = {
  learning: { label: '学习里程碑', color: 'text-green-600' },
  streak: { label: '连续打卡', color: 'text-orange-500' },
  practice: { label: '练习成就', color: 'text-blue-600' },
  level: { label: '等级成就', color: 'text-purple-600' },
}

export default function Achievements() {
  const { unitStatuses, practiceCount, practiceResults } = useProgressStore()

  // 计算统计数据
  const completedUnitIds = Object.entries(unitStatuses)
    .filter(([, s]) => s === 'completed')
    .map(([id]) => id)
  const learnedRoots = completedUnitIds.filter(id => {
    const unit = allUnits.find(u => u.id === id)
    return unit?.type === 'root'
  }).length
  const learnedWords = completedUnitIds.reduce((sum, id) => {
    const unit = allUnits.find(u => u.id === id)
    return sum + (unit?.words.length || 0)
  }, 0)
  const streak = useProgressStore(s => s.getStreakDays())
  const perfectCount = practiceResults.filter(r => r.correct === r.total).length
  const level = calcLevel(learnedRoots, learnedWords, practiceCount)
  const exp = calcExp(learnedRoots, learnedWords, practiceCount)

  // 获取每个成就的当前进度
  const getMetricValue = (metric: string): number => {
    switch (metric) {
      case 'roots': return learnedRoots
      case 'words': return learnedWords
      case 'streak': return streak
      case 'practices': return practiceCount
      case 'perfect': return perfectCount
      case 'level': return level
      default: return 0
    }
  }

  const isUnlocked = (a: Achievement) => getMetricValue(a.metric) >= a.threshold
  const unlockedCount = achievements.filter(isUnlocked).length

  // 等级进度
  const currentLevelExp = expForLevel(level)
  const nextLevelExp = expForLevel(level + 1)
  const levelProgress = Math.min(100, Math.round(((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">成就</h1>
        <p className="text-sm text-gray-500 mt-1">已解锁 {unlockedCount}/{achievements.length} 个成就</p>
      </div>

      {/* Level card */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm opacity-80">学习等级</div>
            <div className="text-4xl font-bold">Lv.{level}</div>
          </div>
          <div className="text-6xl">{level >= 10 ? '🌟' : level >= 5 ? '⭐' : '🌱'}</div>
        </div>
        <div className="bg-white/20 rounded-full h-2.5 overflow-hidden mb-2">
          <div className="bg-white h-full transition-all duration-500" style={{ width: `${levelProgress}%` }} />
        </div>
        <div className="flex justify-between text-xs opacity-80">
          <span>{exp} 总经验</span>
          <span>距下一级 {nextLevelExp - exp} EXP</span>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-xl font-bold text-green-600">{learnedRoots}</div>
          <div className="text-xs text-gray-400">词根</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-xl font-bold text-blue-600">{learnedWords}</div>
          <div className="text-xs text-gray-400">单词</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-xl font-bold text-amber-600">{practiceCount}</div>
          <div className="text-xs text-gray-400">练习</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
          <div className="text-xl font-bold text-red-500">{streak}</div>
          <div className="text-xs text-gray-400">打卡</div>
        </div>
      </div>

      {/* Achievements by category */}
      {Object.entries(categoryConfig).map(([catKey, catCfg]) => {
        const catAchievements = achievements.filter(a => a.category === catKey)
        if (catAchievements.length === 0) return null
        return (
          <div key={catKey}>
            <h2 className={`text-sm font-semibold mb-3 ${catCfg.color}`}>{catCfg.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catAchievements.map(a => {
                const unlocked = isUnlocked(a)
                const current = getMetricValue(a.metric)
                const progress = Math.min(100, Math.round((current / a.threshold) * 100))
                return (
                  <div
                    key={a.id}
                    className={`rounded-2xl p-5 border-2 transition-all ${
                      unlocked
                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl ${unlocked ? '' : 'grayscale opacity-40'}`}>
                        {a.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-sm font-bold ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                          {a.title}
                        </h3>
                        <p className={`text-xs mt-0.5 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                          {a.description}
                        </p>
                      </div>
                      {unlocked && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-medium">
                          已解锁
                        </span>
                      )}
                    </div>
                    {!unlocked && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-right">
                          {current}/{a.threshold}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/courses"
          className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          继续学习，解锁更多成就 →
        </Link>
      </div>
    </div>
  )
}
