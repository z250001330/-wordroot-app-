import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  currentUser: string | null
  users: User[]
  register: (username: string, password: string) => { success: boolean; message: string }
  login: (username: string, password: string) => { success: boolean; message: string }
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],

      register: (username: string, password: string) => {
        const trimmed = username.trim()
        if (trimmed.length < 2) {
          return { success: false, message: '用户名至少需要2个字符' }
        }
        if (password.length < 4) {
          return { success: false, message: '密码至少需要4个字符' }
        }
        const exists = get().users.find(u => u.username === trimmed)
        if (exists) {
          return { success: false, message: '用户名已存在' }
        }
        const newUser: User = {
          username: trimmed,
          password,
          createdAt: new Date().toISOString(),
        }
        set(state => ({
          users: [...state.users, newUser],
          currentUser: trimmed,
        }))
        return { success: true, message: '注册成功' }
      },

      login: (username: string, password: string) => {
        const trimmed = username.trim()
        const user = get().users.find(u => u.username === trimmed)
        if (!user) {
          return { success: false, message: '用户名不存在' }
        }
        if (user.password !== password) {
          return { success: false, message: '密码错误' }
        }
        set({ currentUser: trimmed })
        return { success: true, message: '登录成功' }
      },

      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'wordroot-auth',
    }
  )
)
