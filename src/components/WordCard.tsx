import { useState } from 'react'
import { speak } from '../utils/tts'
import type { WordPart } from '../types'

interface WordCardProps {
  word: string
  phonetic: string
  meaning: string
  parts: WordPart[]
  exampleSentence?: string
  exampleTranslation?: string
  mnemonic?: string
  showSpeak?: boolean
  compact?: boolean
}

const partColors: Record<string, string> = {
  prefix: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
  root: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
  suffix: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
}

export default function WordCard({
  word,
  phonetic,
  meaning,
  parts,
  exampleSentence,
  exampleTranslation,
  mnemonic,
  showSpeak = true,
  compact = false,
}: WordCardProps) {
  const [showMnemonic, setShowMnemonic] = useState(false)

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl ${compact ? 'p-3' : 'p-5'} border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-gray-900 dark:text-gray-100 ${compact ? 'text-base' : 'text-xl'}`}>{word}</span>
            {showSpeak && (
              <button
                onClick={() => speak(word)}
                className="text-primary hover:text-primary-dark transition-colors"
                title="朗读"
              >
                🔊
              </button>
            )}
            <span className="text-sm text-gray-400 font-mono">{phonetic}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{meaning}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex items-center gap-1 flex-wrap text-sm mb-2">
        {parts.map((part, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600 font-bold">+</span>}
            <span className={`px-2 py-0.5 rounded border font-mono text-xs ${partColors[part.type]}`}>
              {part.form}
            </span>
          </div>
        ))}
      </div>

      {/* Mnemonic */}
      {mnemonic && (
        <div className="mb-2">
          <button
            onClick={() => setShowMnemonic(!showMnemonic)}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
          >
            {showMnemonic ? '▾ 收起助记' : '▸ 记忆技巧'}
          </button>
          {showMnemonic && (
            <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 mt-1 animate-fadeIn">
              💡 {mnemonic}
            </p>
          )}
        </div>
      )}

      {/* Example */}
      {exampleSentence && !compact && (
        <div className="border-l-4 border-primary/30 pl-3 mt-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{exampleSentence}"</p>
          {exampleTranslation && (
            <p className="text-xs text-gray-400 mt-1">{exampleTranslation}</p>
          )}
        </div>
      )}
    </div>
  )
}
