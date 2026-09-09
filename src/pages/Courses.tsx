import { useState } from 'react'
import { Link } from 'react-router-dom'
import { courseLevels } from '../data/courseData'
import { useProgressStore } from '../store/progressStore'
import type { LearningUnit, MorphemeType } from '../types'

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: '初级', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  intermediate: { label: '中级', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  advanced: { label: '高级', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
}

const typeConfig: Record<MorphemeType, { label: string; icon: string }> = {
  root: { label: '词根', icon: '🌳' },
  prefix: { label: '前缀', icon: '⚡' },
  suffix: { label: '后缀', icon: '📌' },
}

const statusConfig: Record<string, { label: string; icon: string; color: string }> = {
  not_started: { label: '未开始', icon: '○', color: 'text-gray-400' },
  in_progress: { label: '进行中', icon: '◐', color: 'text-amber-500' },
  completed: { label: '已完成', icon: '●', color: 'text-green-500' },
}

function isLevelUnlocked(levelIndex: number, unitStatuses: Record<string, string>): boolean {
  if (levelIndex === 0) return true
  const prevLevel = courseLevels[levelIndex - 1]
  const allDone = prevLevel.units.every(u => unitStatuses[u.id] === 'completed')
  return allDone
}

export default function Courses() {
  const [expandedLevel, setExpandedLevel] = useState<string | null>('beginner')
  const unitStatuses = useProgressStore(s => s.unitStatuses)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">课程体系</h1>
        <p className="text-sm text-gray-500 mt-1">通过词根、前缀、后缀系统学习英语词汇</p>
      </div>

      {courseLevels.map((level, idx) => {
        const config = levelConfig[level.level]
        const unlocked = isLevelUnlocked(idx, unitStatuses)
        const completedCount = level.units.filter(u => unitStatuses[u.id] === 'completed').length
        const totalCount = level.units.length
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

        const roots = level.units.filter(u => u.type === 'root')
        const prefixes = level.units.filter(u => u.type === 'prefix')
        const suffixes = level.units.filter(u => u.type === 'suffix')

        return (
          <div
            key={level.level}
            className={`rounded-2xl border-2 ${config.bg} overflow-hidden`}
          >
            {/* Level header */}
            <button
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-black/5 transition-colors"
              onClick={() => unlocked && setExpandedLevel(expandedLevel === level.level ? null : level.level)}
              disabled={!unlocked}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{unlocked ? (expandedLevel === level.level ? '📂' : '📁') : '🔒'}</span>
                <div className="text-left">
                  <div className={`text-lg font-bold ${config.color}`}>{config.label}</div>
                  <div className="text-xs text-gray-500">{level.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unlocked && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">{completedCount}/{totalCount}</div>
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${level.level === 'beginner' ? 'bg-green-500' : level.level === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                {unlocked && (
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedLevel === level.level ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Level content */}
            {unlocked && expandedLevel === level.level && (
              <div className="px-5 pb-5 space-y-5 animate-fadeIn">
                {([
                  { type: 'root' as MorphemeType, items: roots },
                  { type: 'prefix' as MorphemeType, items: prefixes },
                  { type: 'suffix' as MorphemeType, items: suffixes },
                ]).filter(g => g.items.length > 0).map(group => (
                  <div key={group.type}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{typeConfig[group.type].icon}</span>
                      <h3 className="text-sm font-semibold text-gray-700">{typeConfig[group.type].label}（{group.items.length}）</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.items.map((unit: LearningUnit) => {
                        const status = unitStatuses[unit.id] || 'not_started'
                        const sc = statusConfig[status]
                        return (
                          <Link
                            key={unit.id}
                            to={`/learn/${unit.id}`}
                            className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="text-lg font-bold text-gray-900 font-mono">{unit.form}</span>
                                <span className="ml-2 text-sm text-gray-500">{unit.meaning}</span>
                              </div>
                              <span className={`text-lg ${sc.color}`} title={sc.label}>{sc.icon}</span>
                            </div>
                            <div className="text-xs text-gray-400 line-clamp-2">{unit.description}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-400">{unit.words.length} 个单词</span>
                              <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">查看 →</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Locked message */}
            {!unlocked && (
              <div className="px-5 pb-4 text-sm text-gray-400">
                完成{levelConfig[courseLevels[idx - 1].level].label}全部单元后解锁
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
