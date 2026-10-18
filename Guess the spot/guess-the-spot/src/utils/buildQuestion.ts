import type { ActiveQuestion, Location } from '../types'
import { getOptions } from './getOptions'
import { pickFresh } from './pickFresh'
import { shuffle } from './shuffle'

/** A question about the photo: either one of the landmark's detail questions or "which country". */
export function buildQuestion(location: Location): ActiveQuestion {
  // Index 0 is the country question; 1..n are the landmark's own detail questions.
  const index = pickFresh('gts-last-question', location.id, location.questions.length + 1)
  if (index === 0) {
    return { text: 'Which country is this?', answer: location.country, options: getOptions(location.country) }
  }
  const { question, answer, wrong } = location.questions[index - 1]
  return { text: question, answer, options: shuffle([answer, ...wrong]) }
}

export function pickFact(location: Location): string {
  return location.facts[pickFresh('gts-last-fact', location.id, location.facts.length)]
}
