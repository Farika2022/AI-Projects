type ScoreCounterProps = {
  nickname: string
  answered: number
  score: number
  total: number
}

export default function ScoreCounter({ nickname, answered, score, total }: ScoreCounterProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-10 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-400 px-5 py-2 text-white shadow-lg shadow-fuchsia-500/30">
      <span className="hidden font-medium text-white/90 sm:inline">{nickname} · </span>
      <span className="font-bold">
        Answered {answered} / {total} · Score: {score}
      </span>
    </div>
  )
}
