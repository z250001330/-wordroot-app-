import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWordBookStore } from '../store/wordBookStore'
import type { WordBookEntry } from '../types'

export default function WordBook() {
  const { entries, removeWord } = useWordBookStore()
  const [view, setView] = useState<'list' | 'grouped'>('grouped')
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [reviewCorrect, setReviewCorrect] = useState(0)
  const [reviewFeedback, setReviewFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showReviewResult, setShowReviewResult] = useState(false)

  // Group by root
  const groups = entries.reduce<Record<string, WordBookEntry[]>>((acc, entry) => {
    const key = entry.rootForm
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  // Review practice: generate choice questions
  const reviewQuestions = entries.map(entry => {
    const distractors = entries
      .filter(e => e.word !== entry.word)
      .map(e => e.meaning)
      .slice(0, 3)
    // Pad with generic distractors if not enough
    while (distractors.length < 3) {
      distractors.push(['查看', '制作', '颜色', '决定', '运动'][distractors.length] || '其他')
    }
    const options = shuffle([entry.meaning, ...distractors])
    return { entry, options, answer: entry.meaning }
  })

  if (entries.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-6xl mb-4">📖</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">生词本还是空的</h2>
        <p className="text-sm text-gray-500 mb-6">练习中答错的单词会自动收集到这里</p>
        <Link to="/courses" className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
          去学习
        </Link>
      </div>
    )
  }

  // Review result
  if (reviewMode && showReviewResult) {
    const accuracy = reviewQuestions.length > 0 ? Math.round((reviewCorrect / reviewQuestions.length) * 100) : 0
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <div className="text-6xl mb-4">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">复习完成！</h2>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-primary">{reviewCorrect}</div>
              <div className="text-xs text-gray-400 mt-1">正确</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-danger">{reviewQuestions.length - reviewCorrect}</div>
              <div className="text-xs text-gray-400 mt-1">错误</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700">{accuracy}%</div>
              <div className="text-xs text-gray-400 mt-1">正确率</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setReviewMode(false)
            setShowReviewResult(false)
            setReviewIdx(0)
            setReviewCorrect(0)
          }}
          className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          返回生词本
        </button>
      </div>
    )
  }

  // Review mode
  if (reviewMode) {
    const q = reviewQuestions[reviewIdx]
    const handleAnswer = (opt: string) => {
      if (reviewFeedback) return
      setSelectedOption(opt)
      const isCorrect = opt === q.answer
      setReviewFeedback(isCorrect ? 'correct' : 'wrong')
      if (isCorrect) setReviewCorrect(c => c + 1)
    }
    const handleNext = () => {
      if (reviewIdx < reviewQuestions.length - 1) {
        setReviewIdx(i => i + 1)
        setReviewFeedback(null)
        setSelectedOption(null)
      } else {
        setShowReviewResult(true)
      }
    }
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>📖 复习生词</span>
            <span>{reviewIdx + 1} / {reviewQuestions.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(reviewIdx / reviewQuestions.length) * 100}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-gray-900 mb-1">{q.entry.word}</p>
            <p className="text-sm text-gray-400 font-mono">{q.entry.phonetic}</p>
            <p className="text-xs text-gray-400 mt-2">
              词根：{q.entry.rootForm}（{q.entry.rootMeaning}）
            </p>
            <p className="text-sm text-gray-500 mt-3">这个单词是什么意思？</p>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={!!reviewFeedback}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedOption === opt
                    ? reviewFeedback === 'correct'
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-red-400 bg-red-50 text-red-700'
                    : reviewFeedback && opt === q.answer
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        {reviewFeedback && (
          <div className="mt-4 flex items-center justify-between animate-fadeIn">
            <div className={`flex items-center gap-2 font-semibold ${reviewFeedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
              <span className="text-2xl">{reviewFeedback === 'correct' ? '✅' : '❌'}</span>
              <span>{reviewFeedback === 'correct' ? '回答正确！' : '回答错误'}</span>
            </div>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              {reviewIdx < reviewQuestions.length - 1 ? '下一题 →' : '查看结果'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">生词本</h1>
          <p className="text-sm text-gray-500 mt-1">{entries.length} 个生词</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grouped')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'grouped' ? 'bg-white text-primary-dark shadow-sm' : 'text-gray-500'}`}
            >
              按词根
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'list' ? 'bg-white text-primary-dark shadow-sm' : 'text-gray-500'}`}
            >
              全部
            </button>
          </div>
          <button
            onClick={() => {
              setReviewMode(true)
              setReviewIdx(0)
              setReviewCorrect(0)
              setReviewFeedback(null)
              setSelectedOption(null)
              setShowReviewResult(false)
            }}
            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            🔄 复习
          </button>
        </div>
      </div>

      {/* Grouped view */}
      {view === 'grouped' && (
        <div className="space-y-4">
          {Object.entries(groups).map(([rootForm, words]) => (
            <div key={rootForm} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-50">
                <span className="text-lg font-mono font-bold text-primary-dark">{rootForm}</span>
                <span className="text-sm text-gray-400">{words[0].rootMeaning}</span>
                <span className="text-xs text-gray-400 ml-auto">{words.length} 词</span>
              </div>
              <div className="space-y-2">
                {words.map(entry => (
                  <WordCard key={entry.word} entry={entry} onRemove={() => removeWord(entry.word)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-2">
          {entries.map(entry => (
            <WordCard key={entry.word} entry={entry} onRemove={() => removeWord(entry.word)} />
          ))}
        </div>
      )}
    </div>
  )
}

function WordCard({ entry, onRemove }: { entry: WordBookEntry; onRemove: () => void }) {
  return (
    <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-gray-900">{entry.word}</span>
          <span className="text-xs text-gray-400 font-mono">{entry.phonetic}</span>
        </div>
        <p className="text-sm text-gray-600">{entry.meaning}</p>
        <div className="flex items-center gap-1 mt-1">
          {entry.parts.map((p, i) => (
            <span key={i} className="text-xs text-gray-400 font-mono">
              {i > 0 && ' + '}{p.form}({p.meaning})
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="移除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
