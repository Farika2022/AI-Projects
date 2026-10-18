import { useState } from 'react'
import type { SyntheticEvent } from 'react'

type JigsawPuzzleProps = {
  url: string
  grid: number
  /** initialOrder[position] = the tile (by its home index) sitting at that position. */
  initialOrder: number[]
  onReady: () => void
  onSolved: () => void
}

const isSolved = (order: number[]) => order.every((tile, i) => tile === i)

export default function JigsawPuzzle({ url, grid, initialOrder, onReady, onSolved }: JigsawPuzzleProps) {
  const [order, setOrder] = useState(initialOrder)
  const [picked, setPicked] = useState<number | null>(null)
  const [aspect, setAspect] = useState<number | null>(null)

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setAspect(img.naturalWidth / img.naturalHeight)
    onReady()
  }

  const handleTap = (position: number) => {
    if (picked === null) return setPicked(position)
    if (picked === position) return setPicked(null)

    const nextOrder = [...order]
    ;[nextOrder[picked], nextOrder[position]] = [nextOrder[position], nextOrder[picked]]
    setOrder(nextOrder)
    setPicked(null)
    if (isSolved(nextOrder)) onSolved()
  }

  if (aspect === null) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-800">
        <div className="absolute inset-0 animate-pulse bg-slate-700" />
        {/* Preload to learn the photo's shape so tiles aren't stretched */}
        <img src={url} alt="" onLoad={handleLoad} onError={onReady} className="hidden" />
      </div>
    )
  }

  return (
    <div
      className="mx-auto grid gap-0.5 overflow-hidden rounded-xl bg-slate-950"
      style={{
        gridTemplateColumns: `repeat(${grid}, 1fr)`,
        aspectRatio: aspect,
        // Fit the whole photo: full width, unless that would make it taller than 60vh.
        width: `min(100%, ${60 * aspect}vh)`,
      }}
    >
      {order.map((tile, position) => {
        const col = tile % grid
        const row = Math.floor(tile / grid)
        return (
          <button
            key={tile}
            type="button"
            aria-label={`Tile ${position + 1}`}
            onClick={() => handleTap(position)}
            className={`transition-transform hover:brightness-110 ${picked === position ? 'z-10 scale-95 ring-4 ring-amber-400' : ''}`}
            style={{
              backgroundImage: `url("${url}")`,
              backgroundSize: `${grid * 100}% ${grid * 100}%`,
              backgroundPosition: `${(col / (grid - 1)) * 100}% ${(row / (grid - 1)) * 100}%`,
            }}
          />
        )
      })}
    </div>
  )
}
