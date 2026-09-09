interface HeatmapProps {
  dates: string[]  // YYYY-MM-DD 格式的学习日期
  weeks?: number   // 显示几周，默认 20 周
}

export default function Heatmap({ dates, weeks = 20 }: HeatmapProps) {
  const dateSet = new Set(dates)
  const today = new Date()
  const totalDays = weeks * 7
  const days: { date: string; count: number; label: string }[] = []

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      count: dateSet.has(dateStr) ? 1 : 0,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
    })
  }

  // 按周分组（列）
  const cols: { date: string; count: number; label: string }[][] = []
  for (let i = 0; i < days.length; i += 7) {
    cols.push(days.slice(i, i + 7))
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-slate-700'
    return 'bg-primary'
  }

  const monthLabels: { index: number; label: string }[] = []
  let lastMonth = -1
  cols.forEach((col, idx) => {
    const firstDay = col[0]
    if (firstDay) {
      const month = new Date(firstDay.date + 'T00:00:00').getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ index: idx, label: `${month + 1}月` })
        lastMonth = month
      }
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                title={`${day.label}${day.count ? ' 已学习' : ' 未学习'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-slate-700" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>多</span>
      </div>
    </div>
  )
}
