import { useProgressStore } from '../store/progressStore'

export default function HeartsBar() {
  const hearts = useProgressStore(s => s.hearts)
  const maxHearts = useProgressStore(s => s.maxHearts)
  const gems = useProgressStore(s => s.gems)
  const refillHearts = useProgressStore(s => s.refillHearts)

  const lost = maxHearts - hearts

  return (
    <div className="flex items-center gap-3">
      {/* Hearts */}
      <div className="flex items-center gap-0.5" title={`心数 ${hearts}/${maxHearts}`}>
        {Array.from({ length: maxHearts }).map((_, i) => (
          <span key={i} className={`text-lg ${i < hearts ? '' : 'opacity-30 grayscale'}`}>
            ❤️
          </span>
        ))}
      </div>
      {lost > 0 && (
        <button
          onClick={refillHearts}
          disabled={gems < 35}
          className="text-xs text-primary hover:text-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
          title={`花费 35 宝石恢复心数（当前 ${gems} 宝石）`}
        >
          +恢复
        </button>
      )}
      {/* Gems */}
      <span className="text-sm text-amber-500 font-medium" title={`宝石 ${gems}`}>
        💎 {gems}
      </span>
    </div>
  )
}
