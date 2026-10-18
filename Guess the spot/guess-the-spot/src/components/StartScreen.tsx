import type { GameMode } from '../types'

type StartScreenProps = {
  nickname: string
  questions: number
  totalLocations: number
  onStart: (mode: GameMode) => void
}

const MODES: { mode: GameMode; emoji: string; label: string; detail: string }[] = [
  { mode: 'quiz', emoji: '🧠', label: 'Quiz', detail: '15 seconds per photo' },
  { mode: 'jigsaw', emoji: '🧩', label: 'Jigsaw', detail: '60 s puzzle, then 15 s to guess' },
]

export default function StartScreen({ nickname, questions, totalLocations, onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/90 p-6 text-center text-white shadow-2xl">
        <p className="text-sm uppercase tracking-widest text-white/50">Welcome,</p>
        <h1 className="mt-1 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-orange-300 bg-clip-text text-3xl font-extrabold text-transparent">
          {nickname}
        </h1>
        <p className="mt-4 text-white/70">
          Pick any {questions} of the {totalLocations} landmarks on the globe and guess which country each one
          is in. The game ends after {questions} questions, right or wrong. How do you want to play?
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {MODES.map(({ mode, emoji, label, detail }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onStart(mode)}
              className="rounded-2xl bg-white/10 px-4 py-5 transition hover:scale-[1.03] hover:bg-white/20"
            >
              <span className="block text-4xl">{emoji}</span>
              <span className="mt-2 block text-lg font-bold">{label}</span>
              <span className="block text-sm text-white/60">{detail}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
