import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useWordBookStore } from '../store/wordBookStore'
import { useProgressStore } from '../store/progressStore'
import { speak } from '../utils/tts'
import type { ReviewQuality, WordBookEntry } from '../types'

const qualityConfig: Record<ReviewQuality, { label: string; interval: string; color: string; bg: string }> = {
  again: { label: '重来', interval: '<10分钟', color: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100 border-red-200' },
  hard: { label: '困难', interval: '1天', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
  good: { label: '良好', interval: '3天', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
  easy: { label: '简单', interval: '7天+', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100 border-green-200' },
}

export default function Review() {
  const dueWords = useWordBookStore(useShallow(s => s.getDueWords()))
  const reviewWord = useWordBookStore(s => s.reviewWord)
  const recordDailyReview = useProgressStore(s => s.recordDailyReview)
  const addXP = useProgressStore(s => s.addXP)
  const addGems = useProgressStore(s => s.addGems)

  const [idx, setIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  // 因 dueWords 可能随状态更新变化，取快照
  const queue = dueWords
  const current: WordBookEntry | undefined = queue[idx]

  const handleQuality = (q: ReviewQuality) => {
    if (!current) return
    reviewWord(current.word, q)
    setReviewedCount(c => c + 1)
    recordDailyReview(1)
    if (q === 'good' || q === 'easy') {
      setCorrectCount(c => c + 1)
      addXP(2)
    } else {
      addXP(1)
    }
    if (reviewedCount + 1 >= queue.length) {
      addGems(5)
      setFinished(true)
      return
    }
    setIdx(i => i + 1)
    setShowAnswer(false)
  }

  if (finished) {
    const accuracy = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <div className="text-6xl mb-4 animate-celebrate">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">复习完成！</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">获得 +5 宝石奖励</p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-primary">{reviewedCount}</div>
              <div className="text-xs text-gray-400 mt-1">已复习</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{correctCount}</div>
              <div className="text-xs text-gray-400 mt-1">掌握</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700 dark:text-gray-200">{accuracy}%</div>
              <div className="text-xs text-gray-400 mt-1">掌握率</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/courses" className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
            继续学习
          </Link>
          <Link to="/wordbook" className="px-6 py-2.5 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-200 font-medium rounded-xl hover:border-gray-300 transition-colors">
            查看生词本
          </Link>
        </div>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">今日没有待复习单词</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">太棒了！所有单词都已掌握或还未到复习时间</p>
        <Link to="/courses" className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
          去学新词
        </Link>
      </div>
    )
  }

  if (!current) return null

  const mastery = current.reviewCount > 0
    ? Math.round((current.correctCount / current.reviewCount) * 100)
    : 0

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>🔄 间隔复习</span>
          <span>{idx + 1} / {queue.length}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((idx) / queue.length) * 100}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
        {/* Word front */}
        <div className="text-center mb-6">
          <button
            onClick={() => speak(current.word)}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
          >
            {current.word} 🔊
          </button>
          <p className="text-sm text-gray-400 font-mono mt-1">{current.phonetic}</p>
          <p className="text-xs text-gray-400 mt-2">
            词根：{current.rootForm}（{current.rootMeaning}）
          </p>
        </div>

        {/* Breakdown */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap text-sm mb-6">
          {current.parts.map((p, i) => (
            <span key={i} className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-mono text-xs">
              {p.form}（{p.meaning}）
            </span>
          ))}
        </div>

        {/* Answer (hidden until tap) */}
        {!showAnswer ? (
          <button
            onClick={() => { setShowAnswer(true); speak(current.word) }}
            className="w-full py-3 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            👀 显示答案
          </button>
        ) : (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{current.meaning}</p>
              {current.reviewCount > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  历史掌握率 {mastery}% · 复习 {current.reviewCount} 次 · 遗忘 {current.lapses} 次
                </p>
              )}
            </div>

            {/* Quality buttons */}
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">你对这个词的掌握程度？</p>
            <div className="grid grid-cols-4 gap-2">
              {(['again', 'hard', 'good', 'easy'] as ReviewQuality[]).map(q => {
                const cfg = qualityConfig[q]
                return (
                  <button
                    key={q}
                    onClick={() => handleQuality(q)}
                    className={`py-3 rounded-xl border-2 text-center transition-all ${cfg.bg}`}
                  >
                    <div className={`font-bold ${cfg.color}`}>{cfg.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{cfg.interval}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
