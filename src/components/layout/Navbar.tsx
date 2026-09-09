import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useWordBookStore } from '../../store/wordBookStore'
import HeartsBar from '../HeartsBar'

const navItems = [
  { path: '/courses', label: '课程', icon: '📚' },
  { path: '/review', label: '复习', icon: '🔄' },
  { path: '/wordbook', label: '生词本', icon: '📖' },
  { path: '/leaderboard', label: '排行', icon: '🏆' },
  { path: '/progress', label: '进度', icon: '📊' },
  { path: '/achievements', label: '成就', icon: '🏅' },
]

export default function Navbar() {
  const { currentUser, logout } = useAuthStore()
  const themeMode = useThemeStore(s => s.mode)
  const toggleTheme = useThemeStore(s => s.toggle)
  const dueCount = useWordBookStore(s => s.getDueWords().length)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
            <span className="text-2xl">🌱</span>
            <span className="text-lg font-bold text-primary-dark hidden sm:inline">词根英语</span>
          </Link>

          {/* Desktop nav */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.path === '/review' && dueCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {dueCount > 9 ? '9+' : dueCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <HeartsBar />
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  title={themeMode === 'dark' ? '切换亮色' : '切换暗色'}
                >
                  {themeMode === 'dark' ? '☀️' : '🌙'}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  👤 {currentUser}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {themeMode === 'dark' ? '☀️' : '🌙'}
                </button>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm text-primary-dark font-medium hover:bg-primary/10 rounded-lg transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-fadeIn">
          {currentUser && (
            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <HeartsBar />
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  {themeMode === 'dark' ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          )}
          <div className="px-4 py-2 space-y-1">
            {currentUser ? navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname.startsWith(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.path === '/review' && dueCount > 0 && (
                  <span className="ml-auto bg-danger text-white text-xs px-1.5 rounded-full">{dueCount}</span>
                )}
              </Link>
            )) : (
              <>
                <Link to="/login" className="block px-3 py-2.5 rounded-lg text-sm text-primary-dark font-medium hover:bg-primary/10" onClick={() => setMobileOpen(false)}>登录</Link>
                <Link to="/register" className="block px-3 py-2.5 rounded-lg text-sm bg-primary text-white font-medium text-center" onClick={() => setMobileOpen(false)}>注册</Link>
              </>
            )}
            {currentUser && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-2 mt-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">👤 {currentUser}</span>
                  <button onClick={handleLogout} className="text-sm text-danger font-medium">退出</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
