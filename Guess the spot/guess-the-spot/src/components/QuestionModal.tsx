import { useEffect } from 'react'
import type { ActiveQuestion, GameMode, Location, Outcome, PuzzleOutcome, Stage } from '../types'
import { useLocationImage } from '../hooks/useLocationImage'
import { JIGSAW_GRID } from '../hooks/useGame'
import PhotoView from './PhotoView'
import JigsawPuzzle from './JigsawPuzzle'

type QuestionModalProps = {
  location: Location
  mode: GameMode
  stage: Stage
  question: ActiveQuestion
  fact: string
  tileOrder: number[]
  puzzleOutcome: PuzzleOutcome | null
  chosenAnswer: string | null
  outcome: Outcome | null
  isLastQuestion: boolean
  onReady: () => void
  onPuzzleDone: (result: PuzzleOutcome) => void
  onAnswer: (choice: string) => void
  onNext: () => void
}

function optionClass(option: string, correct: string, chosen: string | null, answered: boolean): string {
  const base = 'rounded-xl px-4 py-3 font-semibold transition-colors disabled:cursor-default'
  if (!answered) return `${base} bg-white/10 text-white hover:bg-white/20`
  if (option === correct) return `${base} bg-green-500 text-white`
  if (option === chosen) return `${base} bg-red-500 text-white`
  return `${base} bg-white/5 text-white/40`
}

function resultMessage(outcome: Outcome, answer: string): string {
  if (outcome === 'correct') return 'Correct!'
  if (outcome === 'timeout') return `⏰ Time's up! The answer was ${answer}`
  return `The answer was ${answer}`
}

export default function QuestionModal({
  location,
  mode,
  stage,
  question,
  fact,
  tileOrder,
  puzzleOutcome,
  chosenAnswer,
  outcome,
  isLastQuestion,
  onReady,
  onPuzzleDone,
  onAnswer,
  onNext,
}: QuestionModalProps) {
  const { url, loading, error } = useLocationImage(location.wikiTitle)

  // No photo means nothing to wait for (or to puzzle over): start the clock anyway.
  useEffect(() => {
    if (!error) return
    onReady()
    if (stage === 'puzzle') onPuzzleDone('skipped')
  }, [error, stage, onReady, onPuzzleDone])

  const answered = outcome !== null
  const flash = outcome === null ? '' : outcome === 'correct' ? 'animate-flash-green' : 'animate-flash-red'
  const width = mode === 'jigsaw' ? 'max-w-3xl' : 'max-w-md'

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm">
      <div
        className={`max-h-full w-full ${width} overflow-y-auto rounded-2xl bg-slate-900 p-5 text-white shadow-2xl ${flash}`}
      >
        {stage === 'puzzle' ? (
          <>
            <div className="mb-4 flex items-start gap-4">
              {url && (
                <figure className="w-28 shrink-0 sm:w-40">
                  <img src={url} alt="Reference" className="w-full rounded-lg ring-2 ring-white/20" />
                  <figcaption className="mt-1 text-center text-xs text-white/50">Reference</figcaption>
                </figure>
              )}
              <div>
                <h2 className="text-xl font-bold">🧩 Rebuild the photo</h2>
                <p className="mt-1 text-sm text-white/60">
                  Tap two tiles to swap them. The question unlocks when you finish, or when the 60 seconds run
                  out.
                </p>
              </div>
            </div>
            {url ? (
              <JigsawPuzzle
                url={url}
                grid={JIGSAW_GRID}
                initialOrder={tileOrder}
                onReady={onReady}
                onSolved={() => onPuzzleDone('solved')}
              />
            ) : (
              <PhotoView url={null} loading={loading} error={error} onReady={onReady} />
            )}
          </>
        ) : (
          <>
            {puzzleOutcome === 'timeout' && (
              <p className="mb-3 text-center text-sm font-semibold text-amber-300">
                ⏰ Puzzle time's up! Here's how the photo should look.
              </p>
            )}
            {puzzleOutcome === 'solved' && (
              <p className="mb-3 text-center text-sm font-semibold text-green-400">🧩 Puzzle solved!</p>
            )}

            <PhotoView url={url} loading={loading} error={error} onReady={onReady} />

            <h2 className="mx-auto mt-4 max-w-md text-center text-xl font-bold">{question.text}</h2>

            <div className="mx-auto mt-4 grid max-w-md grid-cols-2 gap-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={answered}
                  onClick={() => onAnswer(option)}
                  className={optionClass(option, question.answer, chosenAnswer, answered)}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {outcome && (
          <div className="mx-auto mt-5 max-w-md text-center">
            <p className={`text-lg font-bold ${outcome === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
              {resultMessage(outcome, question.answer)}
            </p>
            <p className="mt-1 font-semibold text-white/80">
              📍 {location.name}, {location.country}
            </p>
            <p className="mt-3 rounded-xl bg-amber-400/10 px-4 py-3 text-left text-sm text-amber-100">
              💡 {fact}
            </p>
            <button
              type="button"
              onClick={onNext}
              className="mt-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-2 font-bold text-white hover:brightness-110"
            >
              {isLastQuestion ? 'See results 🎉' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
