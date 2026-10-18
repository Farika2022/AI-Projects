import { locations } from '../data/locations'
import { shuffle } from './shuffle'

// Extra decoys so the wrong answers aren't always the same handful of countries.
const EXTRA_COUNTRIES = [
  'Germany',
  'Portugal',
  'Vietnam',
  'Russia',
  'Netherlands',
  'Argentina',
  'Chile',
  'Kenya',
  'Morocco',
  'Nigeria',
  'Thailand',
  'Indonesia',
  'South Korea',
  'Turkey',
  'New Zealand',
]

const COUNTRY_POOL = [...new Set([...locations.map((l) => l.country), ...EXTRA_COUNTRIES])]

/** The correct country plus 3 random wrong ones, in random order. */
export function getOptions(correct: string): string[] {
  const wrong = shuffle(COUNTRY_POOL.filter((c) => c !== correct)).slice(0, 3)
  return shuffle([correct, ...wrong])
}
