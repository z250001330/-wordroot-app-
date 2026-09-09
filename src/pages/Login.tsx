import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = login(username, password)
    if (result.success) {
      navigate('/courses')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl">🌱</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">登录</h1>
          <p className="text-sm text-gray-500 mt-1">回到你的学习之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-lg animate-shake">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="输入用户名"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="输入密码"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            登录
          </button>
          <p className="text-center text-sm text-gray-500">
            还没有账号？{' '}
            <Link to="/register" className="text-primary-dark font-medium hover:underline">
              立即注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
