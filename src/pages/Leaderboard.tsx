import { useProgressStore } from '../store/progressStore'
import { Link } from 'react-router-dom'

const LEAGUES = [
  { name: '青铜', icon: '🥉', minXp: 0 },
  { name: '白银', icon: '🥈', minXp: 500 },
  { name: '黄金', icon: '🥇', minXp: 2000 },
  { name: '铂金', icon: '💎', minXp: 5000 },
  { name: '钻石', icon: '👑', minXp: 10000 },
]

function getLeague(xp: number) {
  let league = LEAGUES[0]
  for (const l of LEAGUES) {
    if (xp >= l.minXp) league = l
  }
  return league
}

export default function Leaderboard() {
  const leaderboard = useProgressStore(s => s.leaderboard)
  const xp = useProgressStore(s => s.xp)
  const streak = useProgressStore(s => s.getStreakDays())

  const myLeague = getLeague(xp)
  const myRank = leaderboard.findIndex(e => e.isCurrentUser) + 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">排行榜</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">每周联赛，与全球学习者比拼</p>
      </div>

      {/* My league card */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">当前联赛</div>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className="text-4xl">{myLeague.icon}</span>
              {myLeague.name}联赛
            </div>
            <div className="text-sm opacity-90 mt-1">我的排名：第 {myRank} 名</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{xp}</div>
            <div className="text-xs opacity-80">总 XP</div>
          </div>
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">🏆 本周排行</h2>
          <span className="text-xs text-gray-400">按 XP 排序</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.username + idx}
              className={`flex items-center gap-3 px-5 py-3 ${
                entry.isCurrentUser ? 'bg-primary/5 dark:bg-primary/10' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                idx === 1 ? 'bg-gray-100 text-gray-500' :
                idx === 2 ? 'bg-orange-100 text-orange-600' :
                'bg-gray-50 text-gray-400 dark:bg-slate-700'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${entry.isCurrentUser ? 'text-primary-dark font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                  {entry.username}
                  {entry.isCurrentUser && <span className="ml-2 text-xs text-primary">（我）</span>}
                </div>
                <div className="text-xs text-gray-400">Lv.{entry.level} · 🔥{entry.streak}天</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-gray-100">{entry.xp}</div>
                <div className="text-xs text-gray-400">XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* League promotion info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">📈 联赛晋升</h2>
        <div className="space-y-2">
          {LEAGUES.map(l => {
            const current = xp >= l.minXp
            return (
              <div key={l.name} className={`flex items-center gap-2 text-sm ${current ? 'opacity-100' : 'opacity-50'}`}>
                <span className="text-lg">{l.icon}</span>
                <span className={current ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-500'}>{l.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{l.minXp}+ XP</span>
                {current && <span className="text-xs text-green-600">✓</span>}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">连胜 {streak} 天，继续保持！</p>
      </div>

      <Link to="/courses" className="block text-center px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
        学习赚取 XP →
      </Link>
    </div>
  )
}
