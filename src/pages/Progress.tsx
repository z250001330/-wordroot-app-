import { Link } from 'react-router-dom'
import { courseLevels, allUnits } from '../data/courseData'
import { useProgressStore } from '../store/progressStore'
import { useWordBookStore } from '../store/wordBookStore'
import { calcLevel, calcExp } from '../data/achievements'
import Heatmap from '../components/Heatmap'
import DailyGoals from '../components/DailyGoals'

const levelConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: '初级', color: 'bg-green-500' },
  intermediate: { label: '中级', color: 'bg-blue-500' },
  advanced: { label: '高级', color: 'bg-purple-500' },
}

export default function ProgressPage() {
  const { unitStatuses, practiceCount, learnedDates, practiceResults, xp, hearts, gems, streakFreeze, refillHearts } = useProgressStore()
  const wordBookEntries = useWordBookStore(s => s.entries)
  const masteryRate = useWordBookStore(s => s.getMasteryRate())
  const dueCount = useWordBookStore(s => s.getDueWords().length)

  // 统计数据
  const completedUnits = Object.entries(unitStatuses).filter(([, s]) => s === 'completed')
  const learnedRoots = completedUnits.filter(([id]) => {
    const unit = allUnits.find(u => u.id === id)
    return unit?.type === 'root'
  }).length
  const learnedWords = completedUnits.reduce((sum, [id]) => {
    const unit = allUnits.find(u => u.id === id)
    return sum + (unit?.words.length || 0)
  }, 0)

  const streak = useProgressStore(s => s.getStreakDays())

  const level = calcLevel(learnedRoots, learnedWords, practiceCount)
  const exp = calcExp(learnedRoots, learnedWords, practiceCount)
  const expForCurrent = Math.pow(level - 1, 2) * 10
  const expForNext = Math.pow(level, 2) * 10
  const levelProgress = Math.min(100, Math.round(((exp - expForCurrent) / (expForNext - expForCurrent)) * 100))

  // 数据导出
  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      progress: {
        xp,
        level,
        hearts,
        gems,
        streak,
        learnedRoots,
        learnedWords,
        practiceCount,
        unitStatuses,
        learnedDates,
      },
      wordBook: wordBookEntries,
      practiceResults,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wordroot-progress-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">学习进度</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">追踪你的学习足迹</p>
        </div>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:border-primary/30 hover:text-primary transition-colors"
        >
          📥 导出数据
        </button>
      </div>

      {/* Level card */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm opacity-80">当前等级</div>
            <div className="text-3xl font-bold">Lv.{level}</div>
          </div>
          <div className="text-5xl">{level >= 10 ? '🌟' : level >= 5 ? '⭐' : '🌱'}</div>
        </div>
        <div className="bg-white/20 rounded-full h-2 overflow-hidden mb-1">
          <div className="bg-white h-full transition-all duration-500" style={{ width: `${levelProgress}%` }} />
        </div>
        <div className="flex justify-between text-xs opacity-80">
          <span>{exp} EXP</span>
          <span>下一级 {expForNext} EXP</span>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
          <span>❤️ {hearts}</span>
          <span>💎 {gems}</span>
          <span>🧊 连胜冻结 x{streakFreeze}</span>
        </div>
      </div>

      {/* Daily goals + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyGoals />
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">⚡ 快速操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/review" className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <div className="text-2xl mb-1">🔄</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">复习</div>
              {dueCount > 0 && (
                <div className="text-xs text-danger font-semibold mt-0.5">{dueCount} 待复习</div>
              )}
            </Link>
            <Link to="/wordbook" className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <div className="text-2xl mb-1">📖</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">生词本</div>
              <div className="text-xs text-gray-400 mt-0.5">{wordBookEntries.length} 词</div>
            </Link>
            <Link to="/leaderboard" className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">排行榜</div>
            </Link>
            <Link to="/courses" className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">继续学习</div>
            </Link>
          </div>
          {hearts < 5 && (
            <button
              onClick={refillHearts}
              disabled={gems < 35}
              className="w-full mt-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-40"
            >
              💔 恢复心数（35💎）
            </button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="🌳" label="已学词根" value={learnedRoots} total={allUnits.filter(u => u.type === 'root').length} color="text-green-600" />
        <StatCard icon="📚" label="已学单词" value={learnedWords} color="text-blue-600" />
        <StatCard icon="✏️" label="练习次数" value={practiceCount} color="text-amber-600" />
        <StatCard icon="🔥" label="连续打卡" value={streak} suffix="天" color="text-red-500" />
      </div>

      {/* Mastery stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-primary">{masteryRate}%</div>
          <div className="text-xs text-gray-400 mt-1">生词掌握率</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
          <div className="text-2xl mb-1">📖</div>
          <div className="text-2xl font-bold text-amber-600">{wordBookEntries.length}</div>
          <div className="text-xs text-gray-400 mt-1">生词本单词</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
          <div className="text-2xl mb-1">⏰</div>
          <div className="text-2xl font-bold text-blue-600">{dueCount}</div>
          <div className="text-xs text-gray-400 mt-1">今日待复习</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">📅 学习热力图</h2>
          <span className="text-xs text-gray-400">{learnedDates.length} 天</span>
        </div>
        <Heatmap dates={learnedDates} />
      </div>

      {/* Streak calendar (recent 7 days) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">📆 最近7天</h2>
        <div className="flex justify-between gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            const date = d.toISOString().split('T')[0]
            const hasLearned = learnedDates.includes(date)
            const isToday = date === new Date().toISOString().split('T')[0]
            const dayLabel = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-gray-400'}`}>{dayLabel}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                  hasLearned ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-50 text-gray-300 dark:bg-slate-700 dark:text-slate-500'
                } ${isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800' : ''}`}>
                  {hasLearned ? '✓' : d.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">课程进度</h2>
        <div className="space-y-4">
          {courseLevels.map(level => {
            const total = level.units.length
            const done = level.units.filter(u => unitStatuses[u.id] === 'completed').length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const config = levelConfig[level.level]
            return (
              <div key={level.level}>
                <div className="flex justify-between text-sm mb-1">
                  <Link to="/courses" className="text-gray-700 dark:text-gray-200 hover:text-primary-dark">
                    {config.label}（{done}/{total}）
                  </Link>
                  <span className="text-gray-400">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${config.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent practice */}
      {practiceResults.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">最近练习</h2>
          <div className="space-y-2">
            {practiceResults.slice(-5).reverse().map((r, i) => {
              const unit = allUnits.find(u => u.id === r.unitId)
              const accuracy = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-200">{unit?.form || r.unitId}</span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{r.correct}/{r.total}</span>
                    <span className={`text-sm font-semibold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                      {accuracy}%
                    </span>
                    {r.xpEarned && (
                      <span className="text-xs text-primary">+{r.xpEarned}XP</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, total, suffix, color }: { icon: string; label: string; value: number; total?: number; suffix?: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}{suffix}{total !== undefined && <span className="text-sm text-gray-400">/{total}</span>}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  )
}
