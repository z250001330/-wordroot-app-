import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProgressStore } from '../store/progressStore'
import { useWordBookStore } from '../store/wordBookStore'
import { calcLevel } from '../data/achievements'
import { allUnits } from '../data/courseData'
import DailyGoals from '../components/DailyGoals'

const features = [
  { icon: '🌳', title: '词根拆解学习', desc: '系统学习词根、前缀、后缀，掌握构词规律' },
  { icon: '🎮', title: '四种互动练习', desc: '词根拆解、单词拼写、选择题测验、例句填空' },
  { icon: '🔄', title: '间隔重复复习', desc: 'SM-2 智能算法，科学抗遗忘' },
  { icon: '📖', title: '生词本', desc: '自动收集薄弱单词，针对性复习' },
  { icon: '🏆', title: '成就与排行', desc: '解锁徽章，争夺联赛排名' },
  { icon: '📈', title: '分级递进', desc: '初级→中级→高级，循序渐进' },
]

export default function Home() {
  const currentUser = useAuthStore(s => s.currentUser)

  // 登录用户显示仪表盘
  if (currentUser) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="text-6xl mb-6">🌱</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          词根英语学习APP
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          基于《英语词汇的奥秘》的系统化词根学习法
          <br />
          通过理解前缀+词根+后缀，掌握英语单词的构词密码
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
          >
            免费开始学习
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white dark:bg-slate-800 text-primary-dark font-semibold rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-colors"
          >
            已有账号，登录
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow animate-fadeIn"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">开始你的词根学习之旅</h2>
          <p className="text-white/80 mb-6">注册即可免费使用全部功能</p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-primary-dark font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { unitStatuses, xp, hearts, gems, getStreakDays, dailyGoal, dailyCompletion } = useProgressStore()
  const dueCount = useWordBookStore(s => s.getDueWords().length)
  const wordBookLen = useWordBookStore(s => s.entries.length)

  const completedUnitIds = Object.entries(unitStatuses).filter(([, s]) => s === 'completed').map(([id]) => id)
  const learnedRoots = completedUnitIds.filter(id => allUnits.find(u => u.id === id)?.type === 'root').length
  const learnedWords = completedUnitIds.reduce((sum, id) => sum + (allUnits.find(u => u.id === id)?.words.length || 0), 0)
  const practiceCount = useProgressStore(s => s.practiceCount)
  const level = calcLevel(learnedRoots, learnedWords, practiceCount)
  const streak = getStreakDays()

  // 找到下一个未完成的单元
  const nextUnit = allUnits.find(u => unitStatuses[u.id] !== 'completed')

  return (
    <div className="space-y-6">
      {/* Welcome + stats */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">欢迎回来！👋</h1>
        <p className="text-white/80 text-sm mb-4">今天也要继续加油哦</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-3xl font-bold">Lv.{level}</div>
            <div className="text-xs opacity-80">等级</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{xp}</div>
            <div className="text-xs opacity-80">总 XP</div>
          </div>
          <div>
            <div className="text-3xl font-bold">🔥{streak}</div>
            <div className="text-xs opacity-80">连续天数</div>
          </div>
          <div>
            <div className="text-3xl font-bold">❤️{hearts} 💎{gems}</div>
            <div className="text-xs opacity-80">心数/宝石</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyGoals />
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">⚡ 快捷入口</h2>
          <div className="grid grid-cols-2 gap-3">
            {nextUnit && (
              <Link to={`/learn/${nextUnit.id}`} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <div className="text-2xl mb-1">📚</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">继续学习</div>
                <div className="text-xs text-gray-400 mt-0.5">{nextUnit.form}</div>
              </Link>
            )}
            <Link to="/review" className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <div className="text-2xl mb-1">🔄</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">复习</div>
              {dueCount > 0 && <div className="text-xs text-danger font-semibold mt-0.5">{dueCount} 待复习</div>}
            </Link>
            <Link to="/wordbook" className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <div className="text-2xl mb-1">📖</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">生词本</div>
              <div className="text-xs text-gray-400 mt-0.5">{wordBookLen} 词</div>
            </Link>
            <Link to="/leaderboard" className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">排行榜</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
          <div className="text-2xl mb-1">🌳</div>
          <div className="text-2xl font-bold text-green-600">{learnedRoots}</div>
          <div className="text-xs text-gray-400 mt-1">已学词根</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-2xl font-bold text-blue-600">{learnedWords}</div>
          <div className="text-xs text-gray-400 mt-1">已学单词</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
          <div className="text-2xl mb-1">✏️</div>
          <div className="text-2xl font-bold text-amber-600">{practiceCount}</div>
          <div className="text-xs text-gray-400 mt-1">练习次数</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 text-center">
          <div className="text-2xl mb-1">⏰</div>
          <div className="text-2xl font-bold text-red-500">{dueCount}</div>
          <div className="text-xs text-gray-400 mt-1">待复习</div>
        </div>
      </div>

      {/* Daily goal reminder */}
      {(() => {
        const g = dailyGoal
        const c = dailyCompletion
        const allDone = c.wordsLearned >= g.dailyWords && c.wordsReviewed >= g.dailyReview && c.practicesDone >= g.dailyPractice
        if (allDone) return null
        return (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800">
            <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">🎯 今日目标尚未完成</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              学词 {c.wordsLearned}/{g.dailyWords} · 复习 {c.wordsReviewed}/{g.dailyReview} · 练习 {c.practicesDone}/{g.dailyPractice}
            </p>
          </div>
        )
      })()}
    </div>
  )
}
