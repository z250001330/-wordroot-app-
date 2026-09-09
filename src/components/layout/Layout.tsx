import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { loadProgress, saveProgress, useProgressStore } from '../../store/progressStore'
import { loadWordBook, saveWordBook, useWordBookStore } from '../../store/wordBookStore'
import Navbar from './Navbar'

export default function Layout({ children }: { children: ReactNode }) {
  const currentUser = useAuthStore(s => s.currentUser)

  // Load user-specific data on mount / user change
  useEffect(() => {
    if (!currentUser) return
    loadProgress(currentUser)
    loadWordBook(currentUser)
  }, [currentUser])

  // Auto-save progress on changes
  const practiceCount = useProgressStore(s => s.practiceCount)
  const unitStatuses = useProgressStore(s => s.unitStatuses)
  const wordBookLen = useWordBookStore(s => s.entries.length)

  useEffect(() => {
    if (!currentUser) return
    saveProgress(currentUser)
  }, [currentUser, practiceCount, unitStatuses])

  useEffect(() => {
    if (!currentUser) return
    saveWordBook(currentUser)
  }, [currentUser, wordBookLen])

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
