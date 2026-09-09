import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { courseLevels } from '../data/courseData'
import { useProgressStore } from '../store/progressStore'
import type { LearningUnit, MorphemeType, ExamTag } from '../types'

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: '初级', color: 'text-green-600', bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
  intermediate: { label: '中级', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  advanced: { label: '高级', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' },
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

const examTagConfig: Record<ExamTag, { label: string }> = {
  cet4: { label: '四级' },
  cet6: { label: '六级' },
  kaoyan: { label: '考研' },
  ielts: { label: '雅思' },
  toefl: { label: '托福' },
  gre: { label: 'GRE' },
  daily: { label: '日常' },
}

function isLevelUnlocked(levelIndex: number, unitStatuses: Record<string, string>): boolean {
  if (levelIndex === 0) return true
  const prevLevel = courseLevels[levelIndex - 1]
  const allDone = prevLevel.units.every(u => unitStatuses[u.id] === 'completed')
  return allDone
}

export default function Courses() {
  const [expandedLevel, setExpandedLevel] = useState<string | null>('beginner')
  const [search, setSearch] = useState('')
  const [examFilter, setExamFilter] = useState<ExamTag | null>(null)
  const unitStatuses = useProgressStore(s => s.unitStatuses)

  // 根据搜索和筛选过滤单元
  const filteredLevels = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return courseLevels.map(level => ({
      ...level,
      units: level.units.filter(u => {
        const matchKeyword = !keyword ||
          u.form.toLowerCase().includes(keyword) ||
          u.meaning.includes(search.trim()) ||
          u.description.includes(search.trim()) ||
          u.words.some(w => w.word.toLowerCase().includes(keyword) || w.meaning.includes(search.trim()))
        const matchExam = !examFilter || (u.examTags?.includes(examFilter))
        return matchKeyword && matchExam
      }),
    }))
  }, [search, examFilter])

  const allExamTags: ExamTag[] = ['cet4', 'cet6', 'kaoyan', 'ielts', 'toefl', 'gre', 'daily']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">课程体系</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">通过词根、前缀、后缀系统学习英语词汇</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索词根、单词或释义..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary dark:text-gray-100"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setExamFilter(null)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              examFilter === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {allExamTags.map(tag => (
            <button
              key={tag}
              onClick={() => setExamFilter(examFilter === tag ? null : tag)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                examFilter === tag
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {examTagConfig[tag].label}
            </button>
          ))}
        </div>
      </div>

      {filteredLevels.map((level, idx) => {
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
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => unlocked && setExpandedLevel(expandedLevel === level.level ? null : level.level)}
              disabled={!unlocked}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{unlocked ? (expandedLevel === level.level ? '📂' : '📁') : '🔒'}</span>
                <div className="text-left">
                  <div className={`text-lg font-bold ${config.color}`}>{config.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{level.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unlocked && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{completedCount}/{totalCount}</div>
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{typeConfig[group.type].label}（{group.items.length}）</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.items.map((unit: LearningUnit) => {
                        const status = unitStatuses[unit.id] || 'not_started'
                        const sc = statusConfig[status]
                        return (
                          <Link
                            key={unit.id}
                            to={`/learn/${unit.id}`}
                            className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">{unit.form}</span>
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{unit.meaning}</span>
                              </div>
                              <span className={`text-lg ${sc.color}`} title={sc.label}>{sc.icon}</span>
                            </div>
                            <div className="text-xs text-gray-400 line-clamp-2">{unit.description}</div>
                            {unit.examTags && unit.examTags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {unit.examTags.slice(0, 3).map(tag => (
                                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                                    {examTagConfig[tag].label}
                                  </span>
                                ))}
                              </div>
                            )}
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
                {level.units.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {search || examFilter ? '没有匹配的单元' : '暂无单元'}
                  </div>
                )}
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
