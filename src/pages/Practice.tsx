import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUnitById, allUnits } from '../data/courseData'
import { useProgressStore } from '../store/progressStore'
import { useWordBookStore } from '../store/wordBookStore'
import type { Word, PracticeType, PracticeQuestion } from '../types'

// ====== 工具函数 ======
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickDistractors<T>(pool: T[], count: number): T[] {
  return shuffle(pool).slice(0, count)
}

// ====== 出题函数 ======
function genDecomposeQuestions(words: Word[]): PracticeQuestion[] {
  return shuffle(words).map(w => {
    // 从其他单元的单词中收集干扰项
    const allForms = allUnits
      .flatMap(u => u.words)
      .flatMap(w => w.parts.map(p => `${p.form}（${p.meaning}）`))
    const correctParts = w.parts.map(p => `${p.form}（${p.meaning}）`)
    const options = shuffle([
      ...correctParts,
      ...pickDistractors(allForms.filter(f => !correctParts.includes(f)), 3),
    ])
    return {
      type: 'decompose' as PracticeType,
      word: w.word,
      meaning: w.meaning,
      phonetic: w.phonetic,
      parts: w.parts,
      options,
      answer: [...correctParts].sort().join(' + '),
    }
  })
}

function genSpellingQuestions(words: Word[]): PracticeQuestion[] {
  return shuffle(words).map(w => ({
    type: 'spelling' as PracticeType,
    word: w.word,
    meaning: w.meaning,
    phonetic: w.phonetic,
    parts: w.parts,
  }))
}

function genChoiceQuestions(words: Word[]): PracticeQuestion[] {
  const allMeanings = allUnits.flatMap(u => u.words).map(w => w.meaning)
  return shuffle(words).map(w => {
    const options = shuffle([w.meaning, ...pickDistractors(allMeanings.filter(m => m !== w.meaning), 3)])
    return {
      type: 'choice' as PracticeType,
      word: w.word,
      meaning: w.meaning,
      phonetic: w.phonetic,
      parts: w.parts,
      options,
      answer: w.meaning,
    }
  })
}

function genFillBlankQuestions(words: Word[]): PracticeQuestion[] {
  // 从同一单元的单词中选干扰项
  return shuffle(words).map(w => {
    const blanks = w.exampleSentence.split(w.word)
    const blankedSentence = blanks.length > 1
      ? blanks.join('_____')
      : w.exampleSentence.replace(new RegExp(w.word, 'i'), '_____')
    // 选项：当前单词 + 3个同单元干扰
    const distractors = pickDistractors(
      words.filter(x => x.word !== w.word).map(x => x.word),
      3
    )
    const options = shuffle([w.word, ...distractors])
    return {
      type: 'fillblank' as PracticeType,
      word: w.word,
      meaning: w.meaning,
      phonetic: w.phonetic,
      parts: w.parts,
      blankedSentence,
      exampleTranslation: w.exampleTranslation,
      options,
      answer: w.word,
    }
  })
}

const practiceConfigs: { type: PracticeType; label: string; icon: string; desc: string }[] = [
  { type: 'decompose', label: '词根拆解', icon: '🧩', desc: '选择正确的词根、前缀、后缀组成' },
  { type: 'spelling', label: '单词拼写', icon: '✏️', desc: '根据提示拼写英文单词' },
  { type: 'choice', label: '选择题测验', icon: '📝', desc: '根据词根推断词义' },
  { type: 'fillblank', label: '例句填空', icon: '📖', desc: '在例句中填入正确单词' },
]

// ====== 主组件 ======
export default function Practice() {
  const { unitId } = useParams()
  const recordPractice = useProgressStore(s => s.recordPractice)
  const markUnitCompleted = useProgressStore(s => s.markUnitCompleted)
  const addWord = useWordBookStore(s => s.addWord)
  const hasWord = useWordBookStore(s => s.hasWord)

  const unit = unitId ? getUnitById(unitId) : undefined
  const [selectedType, setSelectedType] = useState<PracticeType | null>(null)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongWords, setWrongWords] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [spellingInput, setSpellingInput] = useState('')

  if (!unit) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">未找到该学习单元</p>
        <Link to="/courses" className="text-primary-dark hover:underline">返回课程列表</Link>
      </div>
    )
  }

  // ====== 选择练习类型 ======
  if (!selectedType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to={`/learn/${unit.id}`} className="hover:text-primary-dark">{unit.form}（{unit.meaning}）</Link>
          <span>/</span>
          <span>选择练习</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">选择练习方式</h1>
          <p className="text-sm text-gray-500 mt-1">{unit.form} · {unit.meaning} · {unit.words.length} 个单词</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {practiceConfigs.map(cfg => (
            <button
              key={cfg.type}
              onClick={() => {
                setSelectedType(cfg.type)
                const qs = cfg.type === 'decompose' ? genDecomposeQuestions(unit.words)
                  : cfg.type === 'spelling' ? genSpellingQuestions(unit.words)
                  : cfg.type === 'choice' ? genChoiceQuestions(unit.words)
                  : genFillBlankQuestions(unit.words)
                setQuestions(qs)
                setCurrentIdx(0)
                setCorrectCount(0)
                setWrongWords([])
                setShowResult(false)
                setFeedback(null)
                setSelectedAnswer(null)
                setSpellingInput('')
              }}
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-primary/30 hover:shadow-md transition-all text-left"
            >
              <div className="text-3xl mb-3">{cfg.icon}</div>
              <h3 className="text-lg font-bold text-gray-900">{cfg.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{cfg.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const cfg = practiceConfigs.find(c => c.type === selectedType)!
  const current = questions[currentIdx]

  // ====== 结果页 ======
  if (showResult) {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <div className="text-6xl mb-4">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">练习完成！</h2>
        <p className="text-gray-500 mb-6">{cfg.icon} {cfg.label}</p>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-primary">{correctCount}</div>
              <div className="text-xs text-gray-400 mt-1">正确</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-danger">{wrongWords.length}</div>
              <div className="text-xs text-gray-400 mt-1">错误</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700">{accuracy}%</div>
              <div className="text-xs text-gray-400 mt-1">正确率</div>
            </div>
          </div>
        </div>

        {wrongWords.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
            <div className="text-sm font-medium text-amber-700 mb-2">📋 已加入生词本的单词：</div>
            <div className="flex flex-wrap gap-2">
              {wrongWords.map(w => (
                <span key={w} className="px-2 py-1 bg-white rounded-lg text-sm text-amber-700 border border-amber-200">{w}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setSelectedType(null)
              setQuestions([])
              setShowResult(false)
            }}
            className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:border-gray-300 transition-colors"
          >
            换种练习
          </button>
          <Link
            to={`/learn/${unit.id}`}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            返回学习
          </Link>
        </div>
      </div>
    )
  }

  // ====== 答题判定 ======
  const handleAnswer = (answer: string) => {
    if (feedback) return
    const isCorrect = answer === current.answer
    setSelectedAnswer(answer)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      const word = current.word
      setWrongWords(prev => [...prev, word])
      if (!hasWord(word) && unit) {
        addWord({
          word: current.word,
          meaning: current.meaning,
          phonetic: current.phonetic,
          rootId: unit.id,
          rootForm: unit.form,
          rootMeaning: unit.meaning,
          parts: current.parts,
        })
      }
    }
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
      setFeedback(null)
      setSelectedAnswer(null)
      setSpellingInput('')
    } else {
      // 练习完成
      recordPractice({
        unitId: unit.id,
        type: selectedType,
        total: questions.length,
        correct: correctCount,
        wrongWords,
      })
      markUnitCompleted(unit.id)
      setShowResult(true)
    }
  }

  const handleSpellingSubmit = () => {
    const normalized = spellingInput.trim().toLowerCase()
    if (!normalized || feedback) return
    const isCorrect = normalized === current.word.toLowerCase()
    setSelectedAnswer(normalized)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      setWrongWords(prev => [...prev, current.word])
      if (!hasWord(current.word) && unit) {
        addWord({
          word: current.word,
          meaning: current.meaning,
          phonetic: current.phonetic,
          rootId: unit.id,
          rootForm: unit.form,
          rootMeaning: unit.meaning,
          parts: current.parts,
        })
      }
    }
  }

  // ====== 答题页 ======
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>{cfg.icon} {cfg.label}</span>
          <span>{currentIdx + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIdx) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        {/* 词根拆解练习 */}
        {selectedType === 'decompose' && current.options && (
          <DecomposeQuestion
            question={current}
            options={current.options}
            feedback={feedback}
            onAnswer={handleAnswer}
          />
        )}

        {/* 单词拼写 */}
        {selectedType === 'spelling' && (
          <div>
            <div className="bg-primary/5 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm text-gray-500 mb-1">词根含义提示</p>
              <p className="text-lg font-mono font-semibold text-primary-dark">
                {current.parts.map(p => `${p.form}（${p.meaning}）`).join(' + ')}
              </p>
            </div>
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-gray-900 mb-2">{current.meaning}</p>
              <p className="text-sm text-gray-400">请拼写对应的英文单词</p>
            </div>
            <input
              type="text"
              value={spellingInput}
              onChange={e => setSpellingInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSpellingSubmit()}
              disabled={!!feedback}
              className={`w-full text-center text-xl font-mono px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                feedback === 'correct'
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : feedback === 'wrong'
                  ? 'border-red-400 bg-red-50 text-red-700 animate-shake'
                  : 'border-gray-200 focus:border-primary'
              }`}
              placeholder="输入单词..."
              autoFocus
            />
            {feedback === 'wrong' && (
              <p className="text-sm text-red-500 mt-2 text-center">正确答案：{current.word}</p>
            )}
            {!feedback && (
              <button
                onClick={handleSpellingSubmit}
                disabled={!spellingInput.trim()}
                className="w-full mt-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-40"
              >
                确认
              </button>
            )}
          </div>
        )}

        {/* 选择题 */}
        {selectedType === 'choice' && current.options && (
          <div>
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-gray-900 mb-1">{current.word}</p>
              <p className="text-sm text-gray-400 font-mono">{current.phonetic}</p>
              <p className="text-xs text-gray-400 mt-2">
                词根：{current.parts.map(p => `${p.form}（${p.meaning}）`).join(' + ')}
              </p>
              <p className="text-sm text-gray-500 mt-3">这个单词是什么意思？</p>
            </div>
            <div className="space-y-2">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!feedback}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedAnswer === opt
                      ? feedback === 'correct'
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-red-400 bg-red-50 text-red-700'
                      : feedback && opt === current.answer
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 例句填空 */}
        {selectedType === 'fillblank' && current.blankedSentence && current.options && (
          <div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-lg text-gray-800 leading-relaxed">{current.blankedSentence}</p>
              <p className="text-sm text-gray-400 mt-2">{current.exampleTranslation}</p>
            </div>
            <p className="text-sm text-gray-500 mb-3">选择正确的单词填空：</p>
            <div className="grid grid-cols-2 gap-2">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!feedback}
                  className={`px-4 py-2.5 rounded-xl border-2 font-mono font-medium transition-all ${
                    selectedAnswer === opt
                      ? feedback === 'correct'
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-red-400 bg-red-50 text-red-700'
                      : feedback && opt === current.answer
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feedback + Next button */}
      {feedback && (
        <div className="mt-4 flex items-center justify-between animate-fadeIn">
          <div className={`flex items-center gap-2 font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
            <span className="text-2xl">{feedback === 'correct' ? '✅' : '❌'}</span>
            <span>{feedback === 'correct' ? '回答正确！' : '回答错误'}</span>
          </div>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            {currentIdx < questions.length - 1 ? '下一题 →' : '查看结果'}
          </button>
        </div>
      )}
    </div>
  )
}

// ====== 词根拆解题目子组件 ======
function DecomposeQuestion({
  question,
  options,
  feedback,
  onAnswer,
}: {
  question: PracticeQuestion
  options: string[]
  feedback: 'correct' | 'wrong' | null
  onAnswer: (answer: string) => void
}) {
  const [selected, setSelected] = useState<string[]>([])

  const correctParts = question.parts.map(p => `${p.form}（${p.meaning}）`)

  const toggle = (opt: string) => {
    if (feedback) return
    setSelected(prev =>
      prev.includes(opt)
        ? prev.filter(x => x !== opt)
        : [...prev, opt]
    )
  }

  const handleSubmit = () => {
    if (selected.length === 0 || feedback) return
    const answer = selected.sort().join(' + ')
    onAnswer(selected.sort().join(' + ') === [...correctParts].sort().join(' + ') ? answer : '__wrong__')
  }

  // Show feedback state for options
  const getOptionClass = (opt: string) => {
    if (!feedback) {
      return selected.includes(opt)
        ? 'border-primary bg-primary/10 text-primary-dark'
        : 'border-gray-200 hover:border-primary/30 hover:bg-primary/5'
    }
    if (correctParts.includes(opt)) {
      return 'border-green-400 bg-green-50 text-green-700'
    }
    if (selected.includes(opt)) {
      return 'border-red-400 bg-red-50 text-red-700'
    }
    return 'border-gray-200 opacity-50'
  }

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-2xl font-bold text-gray-900 font-mono mb-1">{question.word}</p>
        <p className="text-sm text-gray-400 font-mono">{question.phonetic}</p>
        <p className="text-sm text-gray-600 mt-2">{question.meaning}</p>
        <p className="text-xs text-gray-400 mt-2">选择组成这个单词的词根/词缀：</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => toggle(opt)}
            disabled={!!feedback}
            className={`px-3 py-2 rounded-lg border-2 text-sm font-mono transition-all ${getOptionClass(opt)}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected.length > 0 && !feedback && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <span className="text-xs text-gray-400">已选：</span>
          <span className="font-mono text-sm text-gray-700">{selected.join(' + ')}</span>
        </div>
      )}

      {feedback === 'wrong' && (
        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <span className="text-xs text-green-600">正确答案：</span>
          <span className="font-mono text-sm text-green-700">{correctParts.join(' + ')}</span>
        </div>
      )}

      {!feedback && (
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          确认
        </button>
      )}
    </div>
  )
}
