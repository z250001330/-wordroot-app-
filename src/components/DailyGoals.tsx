import { useProgressStore } from '../store/progressStore'
import { useWordBookStore } from '../store/wordBookStore'
import { Link } from 'react-router-dom'

export default function DailyGoals() {
  const dailyGoal = useProgressStore(s => s.dailyGoal)
  const completion = useProgressStore(s => s.dailyCompletion)
  const dueCount = useWordBookStore(s => s.getDueWords().length)
  const isComplete = useProgressStore(s => s.isDailyGoalComplete())

  const goals = [
    {
      label: '学新词',
      current: completion.wordsLearned,
      target: dailyGoal.dailyWords,
      icon: '📚',
      color: 'bg-green-500',
      link: '/courses',
    },
    {
      label: '复习单词',
      current: completion.wordsReviewed,
      target: dailyGoal.dailyReview,
      icon: '🔄',
      color: 'bg-blue-500',
      link: '/review',
      badge: dueCount > 0 ? `${dueCount}待复习` : null,
    },
    {
      label: '练习',
      current: completion.practicesDone,
      target: dailyGoal.dailyPractice,
      icon: '✏️',
      color: 'bg-amber-500',
      link: '/courses',
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">🎯 今日目标</h2>
        {isComplete && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400 font-medium">
            已完成 🎉
          </span>
        )}
      </div>
      <div className="space-y-3">
        {goals.map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100))
          const done = g.current >= g.target
          return (
            <Link to={g.link} key={g.label} className="block">
              <div className="flex items-center gap-3">
                <span className="text-lg">{g.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {g.label}
                      {g.badge && (
                        <span className="ml-2 text-xs text-danger font-medium">({g.badge})</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">
                      {g.current}/{g.target}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${done ? 'bg-green-500' : g.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
