import type { GameMode } from '../types'
import { formatTime } from '../utils/formatTime'

type FinishOverlayProps = {
  nickname: string
  mode: GameMode
  quote: string
  score: number
  total: number
  puzzleTimeMs: number
  quizTimeMs: number
  onPlayAgain: () => void
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 py-3">
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

const PARTY_EMOJIS = ['🎉', '🎊', '🥳']
const EMOJI_COLS = 6
const EMOJI_ROWS = 4

// Random once per page load: one emoji per grid cell, jittered so the spread looks natural.
const BACKGROUND_EMOJIS = Array.from({ length: EMOJI_COLS * EMOJI_ROWS }, (_, i) => ({
  emoji: PARTY_EMOJIS[i % PARTY_EMOJIS.length],
  left: ((i % EMOJI_COLS) + 0.15 + Math.random() * 0.6) * (100 / EMOJI_COLS),
  top: (Math.floor(i / EMOJI_COLS) + 0.15 + Math.random() * 0.6) * (100 / EMOJI_ROWS),
  sizeRem: 2 + Math.random() * 2,
  popDelay: Math.random() * 1.2,
  partyDelay: -Math.random() * 1.6,
  driftDelay: -Math.random() * 7,
}))

const CONFETTI_COLORS = ['#f472b6', '#facc15', '#34d399', '#60a5fa', '#a78bfa', '#fb923c']

// Random once per page load; each piece falls in its own lane at its own pace, forever.
const CONFETTI = Array.from({ length: 70 }, (_, i) => ({
  left: Math.random() * 100,
  delay: Math.random() * 3,
  fallSeconds: 4 + Math.random() * 3,
  flutterSeconds: 1.2 + Math.random() * 1.5,
  width: 6 + Math.random() * 6,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))

function EmojiBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {BACKGROUND_EMOJIS.map((e, i) => (
        // Three nested layers so the motions combine: wander + pop-in + party bounce.
        <div
          key={i}
          className="celebrate-drift absolute"
          style={{ left: `${e.left}%`, top: `${e.top}%`, fontSize: `${e.sizeRem}rem`, animationDelay: `${e.driftDelay}s` }}
        >
          <div className="celebrate-pop" style={{ animationDelay: `${e.popDelay}s` }}>
            <span className="celebrate-party" style={{ animationDelay: `${e.partyDelay}s` }}>
              {e.emoji}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ConfettiRain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {CONFETTI.map((piece, i) => (
        <div
          key={i}
          className="confetti-fall absolute top-0"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.fallSeconds}s`,
          }}
        >
          <div
            className="confetti-flutter rounded-[1px]"
            style={{
              width: piece.width,
              height: piece.width * 0.6,
              backgroundColor: piece.color,
              animationDuration: `${piece.flutterSeconds}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default function FinishOverlay({
  nickname,
  mode,
  quote,
  score,
  total,
  puzzleTimeMs,
  quizTimeMs,
  onPlayAgain,
}: FinishOverlayProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <EmojiBackground />
      <ConfettiRain />

      <div className="celebrate-card relative z-10 w-full max-w-sm rounded-2xl bg-slate-900 p-6 text-center text-white shadow-2xl">
        <div className="text-5xl">🏆</div>
        <h2 className="mt-2 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-orange-300 bg-clip-text text-3xl font-extrabold text-transparent">
          {nickname}
        </h2>
        <p className="mt-4 text-lg italic text-white/90">“{quote}”</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Score" value={`${score} / ${total}`} />
          {mode === 'jigsaw' ? (
            <>
              <Stat label="Total time" value={formatTime(puzzleTimeMs + quizTimeMs)} />
              <Stat label="🧩 Jigsaw time" value={formatTime(puzzleTimeMs)} />
              <Stat label="⏱ Quiz time" value={formatTime(quizTimeMs)} />
            </>
          ) : (
            <Stat label="Total time" value={formatTime(quizTimeMs)} />
          )}
        </div>

        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-2 font-bold text-white hover:brightness-110"
        >
          Play again
        </button>
      </div>
    </div>
  )
}
