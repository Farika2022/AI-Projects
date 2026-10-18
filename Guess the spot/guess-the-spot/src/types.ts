export type DetailQuestion = {
  question: string
  answer: string
  wrong: string[]
}

export type Location = {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  wikiTitle: string
  facts: string[]
  questions: DetailQuestion[]
}

/** The question being asked right now, with its answer options already shuffled. */
export type ActiveQuestion = {
  text: string
  answer: string
  options: string[]
}

export type GameMode = 'quiz' | 'jigsaw'

export type Phase = 'start' | 'playing' | 'finished'

export type Outcome = 'correct' | 'wrong' | 'timeout'

/** Which timer is running for the open question. */
export type Stage = 'puzzle' | 'question'

/** How the jigsaw ended; 'skipped' when the photo couldn't load. */
export type PuzzleOutcome = 'solved' | 'timeout' | 'skipped'
