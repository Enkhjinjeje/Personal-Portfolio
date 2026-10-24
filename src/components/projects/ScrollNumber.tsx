import { wrap } from './useStageLoop'

const pad = (n: number) => String(n).padStart(2, '0')

// From the Imagescroll component: a rolling counter whose digits slide with the scroll position
export default function ScrollNumber({ count, progress, className }: { count: number, progress: number, className?: string }) {
  if (!count) return null
  const position = wrap(Number.isFinite(progress) ? progress : 0, count)
  const active = wrap(Math.round(position), count)
  return <div className={className} role="img" aria-label={`${pad(active + 1)} of ${pad(count)}`}
    style={{ height: '1em', overflow: 'hidden', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
    <div aria-hidden="true" style={{ transform: `translateY(${-position}em)` }}>
      {Array.from({ length: count + 1 }, (_, i) => <div key={i} style={{ height: '1em' }}>{pad(i % count + 1)}</div>)}
    </div>
  </div>
}
