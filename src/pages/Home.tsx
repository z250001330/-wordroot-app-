import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const features = [
  { icon: '🌳', title: '词根拆解学习', desc: '系统学习词根、前缀、后缀，掌握构词规律' },
  { icon: '🎮', title: '四种互动练习', desc: '词根拆解、单词拼写、选择题测验、例句填空' },
  { icon: '📊', title: '进度追踪', desc: '实时追踪学习进度，连续打卡记录' },
  { icon: '📖', title: '生词本', desc: '自动收集薄弱单词，针对性复习' },
  { icon: '🏆', title: '成就系统', desc: '解锁徽章，升级学习等级' },
  { icon: '📈', title: '分级递进', desc: '初级→中级→高级，循序渐进' },
]

export default function Home() {
  const currentUser = useAuthStore(s => s.currentUser)

  if (currentUser) {
    return <Navigate to="/courses" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="text-6xl mb-6">🌱</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          词根英语学习APP
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
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
            className="px-8 py-3 bg-white text-primary-dark font-semibold rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-colors"
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
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fadeIn"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
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
