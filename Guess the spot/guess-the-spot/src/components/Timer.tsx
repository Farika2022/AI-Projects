import { useCountdown } from '../hooks/useCountdown'

type TimerProps = {
  label: string
  startedAt: number | null
  limitMs: number
  onExpire: () => void
}

export default function Timer({ label, startedAt, limitMs, onExpire }: TimerProps) {
  const remaining = useCountdown(startedAt, limitMs, onExpire)
  const seconds = Math.ceil(remaining / 1000)
  const urgent = seconds <= 5

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-4 z-30 -translate-x-1/2 rounded-full px-5 py-2 text-lg font-bold tabular-nums text-white shadow-lg ${
        urgent ? 'animate-pulse bg-red-500 shadow-red-500/40' : 'bg-sky-500 shadow-sky-500/30'
      }`}
    >
      {label} {seconds}s
    </div>
  )
}
