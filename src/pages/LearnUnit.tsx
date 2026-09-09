import { useParams, Link, useNavigate } from 'react-router-dom'
import { getUnitById, allUnits } from '../data/courseData'
import { useProgressStore } from '../store/progressStore'
import { useWordBookStore } from '../store/wordBookStore'
import { speak } from '../utils/tts'
import WordCard from '../components/WordCard'
import type { WordPart } from '../types'

const partColors: Record<string, string> = {
  prefix: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
  root: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
  suffix: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
}

const partLabels: Record<string, string> = {
  prefix: '前缀',
  root: '词根',
  suffix: '后缀',
}

function BreakdownDiagram({ parts, word }: { parts: WordPart[]; word: string }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-sm">
      {parts.map((part, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300 dark:text-gray-600 font-bold">+</span>}
          <div className={`px-2.5 py-1 rounded-lg border font-mono font-semibold ${partColors[part.type]}`}>
            <div className="text-xs opacity-60">{partLabels[part.type]}</div>
            <div>{part.form}</div>
            <div className="text-xs opacity-70">{part.meaning}</div>
          </div>
        </div>
      ))}
      <span className="text-gray-300 dark:text-gray-600 font-bold mx-1">=</span>
      <div className="px-2.5 py-1 rounded-lg border-2 border-primary bg-primary/10 text-primary font-mono font-bold">
        {word}
      </div>
    </div>
  )
}

export default function LearnUnit() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const markUnitInProgress = useProgressStore(s => s.markUnitInProgress)
  const unitStatuses = useProgressStore(s => s.unitStatuses)
  const { addWord, hasWord, removeWord } = useWordBookStore()

  const unit = unitId ? getUnitById(unitId) : undefined

  if (!unit) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">未找到该学习单元</p>
        <Link to="/courses" className="text-primary-dark hover:underline">返回课程列表</Link>
      </div>
    )
  }

  const status = unitStatuses[unit.id] || 'not_started'
  const levelLabel = unit.level === 'beginner' ? '初级' : unit.level === 'intermediate' ? '中级' : '高级'
  const typeLabel = unit.type === 'root' ? '词根' : unit.type === 'prefix' ? '前缀' : '后缀'

  // 同根词族：从其他单元中找包含相同词根的词
  const wordFamily = allUnits
    .filter(u => u.id !== unit.id)
    .flatMap(u => u.words.filter(w => w.parts.some(p => p.form === unit.form)))
    .slice(0, 8)

  const handleStartPractice = () => {
    markUnitInProgress(unit.id)
    navigate(`/practice/${unit.id}`)
  }

  const handleWordBookToggle = (word: string, meaning: string, phonetic: string, parts: WordPart[]) => {
    if (hasWord(word)) {
      removeWord(word)
    } else {
      addWord({
        word,
        meaning,
        phonetic,
        rootId: unit.id,
        rootForm: unit.form,
        rootMeaning: unit.meaning,
        parts,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/courses" className="hover:text-primary-dark">课程</Link>
        <span>/</span>
        <span>{levelLabel}</span>
        <span>/</span>
        <span>{typeLabel}</span>
      </div>

      {/* Unit header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-6 border border-primary/10 dark:border-primary/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-dark font-medium">{typeLabel}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">{levelLabel}</span>
              {unit.examTags && unit.examTags.length > 0 && (
                <div className="flex gap-1">
                  {unit.examTags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-mono">{unit.form}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">{unit.meaning}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-2xl">{unit.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleStartPractice}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
            >
              {status === 'completed' ? '再次练习' : '开始练习'}
            </button>
            {status === 'completed' && (
              <span className="text-xs text-green-600 text-center">✓ 已完成</span>
            )}
          </div>
        </div>
      </div>

      {/* Words */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">派生单词（{unit.words.length}）</h2>
        <div className="space-y-4">
          {unit.words.map((word, idx) => {
            const inBook = hasWord(word.word)
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow animate-fadeIn"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Word header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <button
                        onClick={() => speak(word.word)}
                        className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
                      >
                        {word.word} 🔊
                      </button>
                      <span className="text-sm text-gray-400 font-mono">{word.phonetic}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{word.meaning}</p>
                  </div>
                  <button
                    onClick={() => handleWordBookToggle(word.word, word.meaning, word.phonetic, word.parts)}
                    className={`shrink-0 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      inBook
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {inBook ? '★ 已收藏' : '☆ 加入生词本'}
                  </button>
                </div>

                {/* Breakdown diagram */}
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-2">词根拆解</div>
                  <BreakdownDiagram parts={word.parts} word={word.word} />
                </div>

                {/* Mnemonic */}
                {word.mnemonic && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3">
                    <span className="text-xs text-amber-600 dark:text-amber-400">💡 记忆技巧：</span>
                    <span className="text-sm text-amber-700 dark:text-amber-300 ml-1">{word.mnemonic}</span>
                  </div>
                )}

                {/* Example sentence */}
                <div className="border-l-4 border-primary/30 pl-3">
                  <button onClick={() => speak(word.exampleSentence)} className="text-sm text-gray-700 dark:text-gray-300 italic hover:text-primary text-left">
                    "{word.exampleSentence}" 🔊
                  </button>
                  <p className="text-xs text-gray-400 mt-1">{word.exampleTranslation}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Word family network */}
      {wordFamily.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">🌳 同根词族拓展</h2>
          <p className="text-xs text-gray-400 mb-4">含有「{unit.form}」的其他单词</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wordFamily.map((w, i) => (
              <WordCard
                key={i}
                word={w.word}
                phonetic={w.phonetic}
                meaning={w.meaning}
                parts={w.parts}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
        <Link to="/courses" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-dark">
          ← 返回课程列表
        </Link>
        <button
          onClick={handleStartPractice}
          className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          开始练习 →
        </button>
      </div>
    </div>
  )
}
