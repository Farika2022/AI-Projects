import { NICKNAME_ADJECTIVES, NICKNAME_NOUNS } from '../data/nicknames'
import { shuffle } from './shuffle'

const STORAGE_KEY = 'gts-used-nicknames'

const ALL_NICKNAMES = NICKNAME_ADJECTIVES.flatMap((adj) =>
  NICKNAME_NOUNS.map((noun) => `${adj} ${noun}`),
)

function readUsed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveUsed(used: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(used))
  } catch {
    // Storage unavailable (private mode etc.) — nicknames just won't be remembered.
  }
}

/** A random funny nickname that this browser hasn't been given before. */
export function getNickname(): string {
  let used = readUsed()
  let available = ALL_NICKNAMES.filter((name) => !used.includes(name))
  if (available.length === 0) {
    // Every name has been handed out — start the cycle again.
    used = []
    available = ALL_NICKNAMES
  }
  const nickname = shuffle(available)[0]
  saveUsed([...used, nickname])
  return nickname
}
