import { useCallback, useState } from 'react'
import { getQuote } from '../data/quotes'
import type { ActiveQuestion, GameMode, Location, Outcome, Phase, PuzzleOutcome, Stage } from '../types'
import { buildQuestion, pickFact } from '../utils/buildQuestion'
import { getNickname } from '../utils/getNickname'
import { scrambleTiles } from '../utils/shuffle'

export const QUESTIONS_PER_GAME = 10
export const JIGSAW_GRID = 3
export const TIME_LIMIT_MS: Record<Stage, number> = { puzzle: 60_000, question: 15_000 }

type GameState = {
  phase: Phase
  mode: GameMode
  nickname: string
  score: number
  answeredIds: string[]
  puzzleTimeMs: number
  quizTimeMs: number
  selected: Location | null
  /** Jigsaw questions start at 'puzzle'; quiz questions go straight to 'question'. */
  stage: Stage
  question: ActiveQuestion | null
  /** The fact shown after answering; picked per question so it varies between games. */
  fact: string
  tileOrder: number[]
  /** When the current stage's timer started; null until the photo is ready. */
  startedAt: number | null
  puzzleOutcome: PuzzleOutcome | null
  chosenAnswer: string | null
  outcome: Outcome | null
  quote: string
}

function createInitialState(nickname: string): GameState {
  return {
    phase: 'start',
    mode: 'quiz',
    nickname,
    score: 0,
    answeredIds: [],
    puzzleTimeMs: 0,
    quizTimeMs: 0,
    selected: null,
    stage: 'question',
    question: null,
    fact: '',
    tileOrder: [],
    startedAt: null,
    puzzleOutcome: null,
    chosenAnswer: null,
    outcome: null,
    quote: '',
  }
}

const CLOSED_QUESTION = {
  selected: null,
  question: null,
  fact: '',
  tileOrder: [],
  startedAt: null,
  puzzleOutcome: null,
  chosenAnswer: null,
  outcome: null,
} satisfies Partial<GameState>

const timeSpent = (startedAt: number | null, now: number, stage: Stage) =>
  startedAt === null ? 0 : Math.min(now - startedAt, TIME_LIMIT_MS[stage])

export function useGame() {
  const [state, setState] = useState<GameState>(() => createInitialState(getNickname()))

  const startGame = useCallback((mode: GameMode) => {
    setState((s) => (s.phase === 'start' ? { ...s, phase: 'playing', mode } : s))
  }, [])

  const selectLocation = useCallback((location: Location) => {
    // Randomise here (in the click handler) so it stays fixed for this question.
    const question = buildQuestion(location)
    const fact = pickFact(location)
    const tileOrder = scrambleTiles(JIGSAW_GRID * JIGSAW_GRID)
    setState((s) => {
      const canSelect =
        s.phase === 'playing' &&
        !s.selected &&
        !s.answeredIds.includes(location.id) &&
        s.answeredIds.length < QUESTIONS_PER_GAME
      if (!canSelect) return s
      const stage: Stage = s.mode === 'jigsaw' ? 'puzzle' : 'question'
      return { ...s, ...CLOSED_QUESTION, selected: location, stage, question, fact, tileOrder }
    })
  }, [])

  const startTimer = useCallback(() => {
    const now = Date.now()
    setState((s) => (s.selected && s.startedAt === null ? { ...s, startedAt: now } : s))
  }, [])

  /** The jigsaw is over (solved, out of time, or no photo) — move on to the question with a fresh clock. */
  const finishPuzzle = useCallback((result: PuzzleOutcome) => {
    const now = Date.now()
    setState((s) => {
      if (!s.selected || s.stage !== 'puzzle') return s
      return {
        ...s,
        stage: 'question',
        puzzleOutcome: result,
        puzzleTimeMs: s.puzzleTimeMs + timeSpent(s.startedAt, now, 'puzzle'),
        startedAt: now,
      }
    })
  }, [])

  /** `null` means the question timer ran out. */
  const answer = useCallback((choice: string | null) => {
    const now = Date.now()
    setState((s) => {
      if (!s.selected || !s.question || s.stage !== 'question' || s.outcome) return s
      const correct = choice === s.question.answer
      return {
        ...s,
        chosenAnswer: choice,
        outcome: choice === null ? 'timeout' : correct ? 'correct' : 'wrong',
        answeredIds: [...s.answeredIds, s.selected.id],
        score: correct ? s.score + 1 : s.score,
        quizTimeMs: s.quizTimeMs + timeSpent(s.startedAt, now, 'question'),
      }
    })
  }, [])

  const timeout = useCallback(() => {
    if (state.stage === 'puzzle') finishPuzzle('timeout')
    else answer(null)
  }, [state.stage, finishPuzzle, answer])

  const next = useCallback(() => {
    const roll = Math.random()
    setState((s) =>
      s.answeredIds.length >= QUESTIONS_PER_GAME
        ? { ...s, ...CLOSED_QUESTION, phase: 'finished', quote: getQuote(s.score, roll) }
        : { ...s, ...CLOSED_QUESTION },
    )
  }, [])

  const playAgain = useCallback(() => {
    setState(createInitialState(getNickname()))
  }, [])

  return {
    ...state,
    total: QUESTIONS_PER_GAME,
    timeLimitMs: TIME_LIMIT_MS[state.stage],
    isLastQuestion: state.answeredIds.length >= QUESTIONS_PER_GAME,
    startGame,
    selectLocation,
    startTimer,
    finishPuzzle,
    answer,
    timeout,
    next,
    playAgain,
  }
}
