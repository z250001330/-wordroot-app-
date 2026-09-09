import { Link } from 'react-router-dom'
import { courseLevels, allUnits } from '../data/courseData'
import { useProgressStore } from '../store/progressStore'
import { useWordBookStore } from '../store/wordBookStore'
import { calcLevel, calcExp } from '../data/achievements'

const levelConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: '初级', color: 'bg-green-500' },
  intermediate: { label: '中级', color: 'bg-blue-500' },
  advanced: { label: '高级', color: 'bg-purple-500' },
}

export default function ProgressPage() {
  const { unitStatuses, practiceCount, learnedDates, practiceResults } = useProgressStore()
  const wordBookLen = useWordBookStore(s => s.entries.length)

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

  // 连续打卡
  const streak = useProgressStore(s => s.getStreakDays())

  // 等级
  const level = calcLevel(learnedRoots, learnedWords, practiceCount)
  const exp = calcExp(learnedRoots, learnedWords, practiceCount)
  const expForCurrent = Math.pow(level - 1, 2) * 10
  const expForNext = Math.pow(level, 2) * 10
  const levelProgress = Math.min(100, Math.round(((exp - expForCurrent) / (expForNext - expForCurrent)) * 100))

  // 最近7天打卡
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">学习进度</h1>
        <p className="text-sm text-gray-500 mt-1">追踪你的学习足迹</p>
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
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="🌳" label="已学词根" value={learnedRoots} total={allUnits.filter(u => u.type === 'root').length} color="text-green-600" />
        <StatCard icon="📚" label="已学单词" value={learnedWords} color="text-blue-600" />
        <StatCard icon="✏️" label="练习次数" value={practiceCount} color="text-amber-600" />
        <StatCard icon="🔥" label="连续打卡" value={streak} suffix="天" color="text-red-500" />
      </div>

      {/* Streak calendar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">📅 最近7天</h2>
        <div className="flex justify-between gap-2">
          {last7Days.map(date => {
            const hasLearned = learnedDates.includes(date)
            const isToday = date === today
            const d = new Date(date)
            const dayLabel = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-gray-400'}`}>{dayLabel}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                  hasLearned ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-300'
                } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  {hasLearned ? '✓' : d.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">课程进度</h2>
        <div className="space-y-4">
          {courseLevels.map(level => {
            const total = level.units.length
            const done = level.units.filter(u => unitStatuses[u.id] === 'completed').length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const config = levelConfig[level.level]
            return (
              <div key={level.level}>
                <div className="flex justify-between text-sm mb-1">
                  <Link to="/courses" className="text-gray-700 hover:text-primary-dark">
                    {config.label}（{done}/{total}）
                  </Link>
                  <span className="text-gray-400">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${config.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent practice */}
      {practiceResults.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">最近练习</h2>
          <div className="space-y-2">
            {practiceResults.slice(-5).reverse().map((r, i) => {
              const unit = allUnits.find(u => u.id === r.unitId)
              const accuracy = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-700">{unit?.form || r.unitId}</span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{r.correct}/{r.total}</span>
                    <span className={`text-sm font-semibold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                      {accuracy}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/courses" className="bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all text-center">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-sm font-medium text-gray-700">继续学习</div>
        </Link>
        <Link to="/wordbook" className="bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all text-center">
          <div className="text-2xl mb-1">📖</div>
          <div className="text-sm font-medium text-gray-700">生词本（{wordBookLen}）</div>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, total, suffix, color }: { icon: string; label: string; value: number; total?: number; suffix?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}{suffix}{total !== undefined && <span className="text-sm text-gray-400">/{total}</span>}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  )
}
