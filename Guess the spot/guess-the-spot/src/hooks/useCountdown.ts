import { useEffect, useState } from 'react'

/** Milliseconds left on a timer that started at `startedAt` (paused while null). */
export function useCountdown(startedAt: number | null, limitMs: number, onExpire: () => void): number {
  const [remaining, setRemaining] = useState(limitMs)

  useEffect(() => {
    if (startedAt === null) return
    let expired = false
    const id = setInterval(() => {
      const left = Math.max(0, limitMs - (Date.now() - startedAt))
      setRemaining(left)
      if (left === 0 && !expired) {
        expired = true
        onExpire()
      }
    }, 200)
    return () => clearInterval(id)
  }, [startedAt, limitMs, onExpire])

  return remaining
}
